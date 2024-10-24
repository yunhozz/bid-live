import { CreateUserEvent, KafkaConstants, ProducerService, RedisRepository } from '@app/common';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { CreateUserRequestDTO } from '../dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from '../dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from '../dto/response/jwt-token-response.dto';
import { UserPasswordRepository } from '../repository/user-password.repository';
import { UserRepository } from '../repository/user.repository';
import { JwtPayload } from '../type/jwt-payload.type';

@Injectable()
export class AuthService {
	private readonly secret: string;
	private readonly accessTokenExpiresIn: number;
	private readonly refreshTokenExpiresIn: number;

	constructor(
		private readonly userRepository: UserRepository,
		private readonly userPasswordRepository: UserPasswordRepository,
		private readonly redisRepository: RedisRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly producerService: ProducerService
	) {
		this.secret = configService.get('JWT_SECRET');
		this.accessTokenExpiresIn = configService.get('JWT_ACCESS_EXPIRES_IN');
		this.refreshTokenExpiresIn = configService.get('JWT_REFRESH_EXPIRES_IN');
	}

	async createUser(dto: CreateUserRequestDTO): Promise<number> {
		const email = dto.email;
		const duplicated = await this.userRepository.findUnique({
			where: { email }
		});

		if (duplicated) {
			throw new BadRequestException(`A duplicate email exists : ${email}`);
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(dto.password, salt);

		const user: User = await this.userRepository.create({
			data: {
				email,
				name: dto.name,
				nickname: dto.nickname,
				age: dto.age,
				phoneNumber: dto.phoneNumber,
				userPassword: {
					create: {
						password: hashedPassword,
						salt
					}
				}
			}
		});

		await this.producerService.produce({
			topic: KafkaConstants.CREATE_USER_TOPIC,
			messages: [
				{
					value: JSON.stringify(
						new CreateUserEvent(user.id, user.email, user.name, user.nickname)
					)
				}
			]
		});

		return user.id;
	}

	async loginUser(dto: UserLoginRequestDTO): Promise<JwtTokenResponseDTO> {
		const user = await this.userRepository.findUniqueOrThrow({
			where: { email: dto.email },
			select: {
				id: true,
				email: true,
				role: true,
				userPassword: {
					select: {
						password: true
					}
				}
			}
		});

		if (await bcrypt.compare(dto.password, user.userPassword?.password)) {
			const tokenResponseDTO = await this.generateJwtTokens(user.id, user.email, user.role);
			await this.redisRepository.set(
				user.email,
				tokenResponseDTO.refreshToken,
				tokenResponseDTO.refreshTokenExpires
			);

			return tokenResponseDTO;
		} else {
			throw new UnauthorizedException('Please check your password again.');
		}
	}

	async validateJwtPayload(req: Request, payload: JwtPayload): Promise<boolean> {
		const { sub, username, role, iat, exp } = payload;
		const user = await this.userRepository.findUnique({
			where: {
				id: sub,
				email: username
			}
		});

		if (user) {
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

		return false;
	}

	async logoutUser(username: string): Promise<void> {
		await this.redisRepository.delete(username);
	}

	async withdrawUser(userId: number, username: string): Promise<void> {
		const deleteUser = this.userRepository.delete({
			where: { id: userId }
		});
		const deleteUserPassword = this.userPasswordRepository.delete({
			where: { userId }
		});
		const deleteRefreshToken = this.redisRepository.delete(username);

		await Promise.all([deleteUser, deleteUserPassword, deleteRefreshToken]);
	}

	private async generateJwtTokens(
		sub: number,
		username: string,
		role: Role
	): Promise<JwtTokenResponseDTO> {
		const payload = { sub, username, role };
		const accessToken = this.jwtService.sign(payload, {
			secret: this.secret,
			expiresIn: `${this.accessTokenExpiresIn}s`
		});
		const refreshToken = this.jwtService.sign(payload, {
			secret: this.secret,
			expiresIn: `${this.refreshTokenExpiresIn}s`
		});

		return new JwtTokenResponseDTO(
			sub,
			accessToken,
			refreshToken,
			this.accessTokenExpiresIn,
			this.refreshTokenExpiresIn
		);
	}

	private async reissueToken(
		sub: number,
		username: string,
		role: Role
	): Promise<JwtTokenResponseDTO> {
		let refreshToken = await this.redisRepository.get(username);
		if (!refreshToken) {
			throw new UnauthorizedException('Please log in again.');
		}

		if (!this.jwtService.verify(refreshToken, { secret: this.secret })) {
			throw new UnauthorizedException('Invalid refresh token.');
		}

		return this.generateJwtTokens(sub, username, role);
	}

	private async checkExpiration(exp: number): Promise<boolean> {
		const now = Math.floor(Date.now() / 1000);
		return exp - now >= 180;
	}
}
