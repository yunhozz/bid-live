import {
	CreateUserEvent,
	KAFKA_CONSTANTS,
	ProducerService,
	RedisRepository,
	Role
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
import { JwtPayload, JwtUser } from './type/jwt-payload.type';
import { TUser, TUserPassword } from './type/user.type';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly userPasswordRepository: UserPasswordRepository,
		private readonly redisRepository: RedisRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly producerService: ProducerService
	) {}

	async createUser(dto: CreateUserRequestDTO): Promise<ObjectId> {
		const email = dto.email;

		if (await this.userRepository.exists({ email })) {
			throw new BadRequestException(`A duplicate email exists : ${email}`);
		}

		const user: TUser = {
			email,
			name: dto.name,
			nickname: dto.nickname,
			age: dto.age,
			phoneNumber: dto.phoneNumber
		};

		const userSchema = plainToInstance(User, user);
		const createdUser = await this.userRepository.create(userSchema);

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(dto.password, salt);
		const userPassword: TUserPassword = {
			userId: createdUser._id,
			password: hashedPassword,
			salt
		};

		await this.userPasswordRepository.create(plainToInstance(UserPassword, userPassword));

		await this.producerService.produce({
			topic: KAFKA_CONSTANTS.CREATE_USER_TOPIC,
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
		const user = await this.userRepository.findOne({ email: dto.email });
		if (user) {
			const userPassword = await this.userPasswordRepository.findOne({ userId: user._id });
			if (userPassword && (await bcrypt.compare(dto.password, userPassword.password))) {
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

	async validateJwtPayload(req: Request, payload: JwtPayload): Promise<JwtUser> {
		const { sub, username, role, iat, exp } = payload;
		const token = req.headers.authorization?.replace('Bearer ', '');

		if (!token) {
			throw new UnauthorizedException('Please log in first!');
		}

		if (!(await this.userRepository.exists({ _id: sub }))) {
			throw new NotFoundException(`User Not Found : ${sub}`);
		}

		if (!(await this.checkExpiration(token, exp))) {
			const tokenResponseDTO = await this.reissueToken(sub, username, role);
			req['New-Token'] = tokenResponseDTO.accessToken;
			await this.redisRepository.set(
				username,
				tokenResponseDTO.refreshToken,
				tokenResponseDTO.refreshTokenExpires
			);
		}

		return { sub, username, role };
	}

	private async generateJwtTokens(
		sub: ObjectId,
		username: string,
		role: Role
	): Promise<JwtTokenResponseDTO> {
		const payload = { sub, username, role };
		const secret = this.configService.get('JWT_SECRET');
		const accessTokenExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN');
		const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');

		const accessToken = this.jwtService.sign(payload, {
			secret,
			expiresIn: `${accessTokenExpiresIn}s`
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret,
			expiresIn: `${refreshTokenExpiresIn}s`
		});

		return new JwtTokenResponseDTO(sub, accessToken, refreshToken, refreshTokenExpiresIn);
	}

	private async reissueToken(
		sub: ObjectId,
		username: string,
		role: Role
	): Promise<JwtTokenResponseDTO> {
		let refreshToken = await this.redisRepository.get(username);
		if (!refreshToken) {
			throw new UnauthorizedException('Please log in again.');
		}

		const secret = this.configService.get('JWT_SECRET');
		if (!this.jwtService.verify(refreshToken, { secret })) {
			throw new UnauthorizedException('Invalid refresh token.');
		}

		return this.generateJwtTokens(sub, username, role);
	}

	private async checkExpiration(token: string, exp: number): Promise<boolean> {
		const now = Math.floor(Date.now() / 1000);
		return exp - now >= 180;
	}
}
