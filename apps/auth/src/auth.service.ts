import {
	CreateUserEvent,
	KafkaConstants,
	ProducerService,
	RedisRepository,
	TRole
} from '@app/common';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from './dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from './dto/response/jwt-token-response.dto';
import { UserPasswordRepository } from './persistence/repository/user-password.repository';
import { UserRepository } from './persistence/repository/user.repository';
import { UserPassword } from './persistence/schema/user-password.schema';
import { User } from './persistence/schema/user.schema';
import { JwtPayload } from './type/jwt-payload.type';

@Injectable()
export class AuthService {
	private readonly JWT_SECRET: string;
	private readonly JWT_ACCESS_EXPIRES_IN: number;
	private readonly JWT_REFRESH_EXPIRES_IN: number;

	constructor(
		private readonly userRepository: UserRepository,
		private readonly userPasswordRepository: UserPasswordRepository,
		private readonly redisRepository: RedisRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly producerService: ProducerService
	) {
		this.JWT_SECRET = configService.get('JWT_SECRET');
		this.JWT_ACCESS_EXPIRES_IN = configService.get('JWT_ACCESS_EXPIRES_IN');
		this.JWT_REFRESH_EXPIRES_IN = configService.get('JWT_REFRESH_EXPIRES_IN');
	}

	async createUser(dto: CreateUserRequestDTO): Promise<ObjectId> {
		const email = dto.email;

		if (await this.userRepository.exists({ email })) {
			throw new BadRequestException(`A duplicate email exists : ${email}`);
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(dto.password, salt);
		const userPasswordSchema = plainToInstance(UserPassword, {
			password: hashedPassword,
			salt
		});
		const userPassword = await this.userPasswordRepository.create(userPasswordSchema);

		const userSchema = plainToInstance(User, {
			email,
			name: dto.name,
			nickname: dto.nickname,
			age: dto.age,
			phoneNumber: dto.phoneNumber,
			userPassword: { _id: userPassword._id, ...userPasswordSchema }
		});
		const createdUser = await this.userRepository.create(userSchema);

		await this.producerService.produce({
			topic: KafkaConstants.CREATE_USER_TOPIC,
			messages: [
				{
					value: JSON.stringify(
						new CreateUserEvent(
							createdUser._id,
							createdUser.email,
							createdUser.name,
							createdUser.nickname
						)
					)
				}
			]
		});

		return createdUser._id;
	}

	async loginUser(dto: UserLoginRequestDTO): Promise<JwtTokenResponseDTO> {
		const user = await this.userRepository.findOne({ email: dto.email }, 'userPassword');
		if (user) {
			if (await bcrypt.compare(dto.password, user.userPassword.password)) {
				const tokenResponseDTO = await this.generateJwtTokens(
					user._id,
					user.email,
					user.role
				);
				await this.redisRepository.set(
					user.email,
					tokenResponseDTO.refreshToken,
					tokenResponseDTO.refreshTokenExpires
				);

				return tokenResponseDTO;
			} else {
				throw new UnauthorizedException('Please check your password again.');
			}
		} else {
			throw new NotFoundException(`User Not Found : ${dto.email}`);
		}
	}

	async validateJwtPayload(req: Request, payload: JwtPayload): Promise<boolean> {
		const { sub, username, role, iat, exp } = payload;

		if (!(await this.userRepository.exists({ _id: sub, email: username }))) {
			return false;
		}

		if (!(await this.checkExpiration(exp))) {
			const tokenResponseDTO = await this.reissueToken(sub, username, role);
			req['New-Token'] = tokenResponseDTO.accessToken;
			await this.redisRepository.set(
				username,
				tokenResponseDTO.refreshToken,
				tokenResponseDTO.refreshTokenExpires
			);
		}

		return true;
	}

	async logoutUser(username: string): Promise<void> {
		await this.redisRepository.delete(username);
	}

	async withdrawUser(userId: ObjectId, username: string): Promise<void> {
		const user = await this.userRepository.findOne({ _id: userId }, 'userPassword');
		const deleteUser = this.userRepository.deleteOne({ _id: user._id });
		const deleteUserPassword = this.userPasswordRepository.deleteOne({
			_id: user.userPassword._id
		});
		const deleteRefreshToken = this.redisRepository.delete(username);

		await Promise.all([deleteUser, deleteUserPassword, deleteRefreshToken]);
	}

	private async generateJwtTokens(
		sub: ObjectId,
		username: string,
		role: TRole
	): Promise<JwtTokenResponseDTO> {
		const payload = { sub, username, role };
		const accessToken = this.jwtService.sign(payload, {
			secret: this.JWT_SECRET,
			expiresIn: `${this.JWT_ACCESS_EXPIRES_IN}s`
		});
		const refreshToken = this.jwtService.sign(payload, {
			secret: this.JWT_SECRET,
			expiresIn: `${this.JWT_REFRESH_EXPIRES_IN}s`
		});

		return new JwtTokenResponseDTO(
			sub,
			accessToken,
			refreshToken,
			this.JWT_ACCESS_EXPIRES_IN,
			this.JWT_REFRESH_EXPIRES_IN
		);
	}

	private async reissueToken(
		sub: ObjectId,
		username: string,
		role: TRole
	): Promise<JwtTokenResponseDTO> {
		let refreshToken = await this.redisRepository.get(username);
		if (!refreshToken) {
			throw new UnauthorizedException('Please log in again.');
		}

		if (!this.jwtService.verify(refreshToken, { secret: this.JWT_SECRET })) {
			throw new UnauthorizedException('Invalid refresh token.');
		}

		return this.generateJwtTokens(sub, username, role);
	}

	private async checkExpiration(exp: number): Promise<boolean> {
		const now = Math.floor(Date.now() / 1000);
		return exp - now >= 180;
	}
}
