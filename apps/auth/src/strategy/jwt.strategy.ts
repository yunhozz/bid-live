import { RedisRepository, Role } from '@app/common';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtTokenResponseDTO } from '../dto/response/jwt-token-response.dto';
import { UserRepository } from '../persistence/repository/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly userRepository: UserRepository,
		private readonly redisRepository: RedisRepository
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('JWT_SECRET'),
			ignoreExpiration: true,
			passReqToCallback: true
		});
	}

	async validate(req: Request, payload: any): Promise<any> {
		const token = req.headers.authorization?.replace('Bearer ', '');
		const { sub, username, role, iat, exp } = payload;

		if (!(await this.userRepository.exists({ _id: sub }))) {
			throw new NotFoundException();
		}
		if (!(await this.checkExpiration(token, exp))) {
			const tokenResponseDTO = await this.reissueToken(sub, username, role);
			req['newAccessToken'] = tokenResponseDTO.accessToken;
			await this.redisRepository.set(sub, tokenResponseDTO.refreshToken);
		}

		return { sub, username, role };
	}

	private async checkExpiration(token: string, exp: number): Promise<boolean> {
		const now = Math.floor(Date.now() / 1000);
		return exp - now >= 180;
	}

	private async reissueToken(sub: ObjectId, username: string, role: Role): Promise<JwtTokenResponseDTO> {
		let refreshToken = await this.redisRepository.get(username);
		if (!refreshToken) {
			throw new UnauthorizedException('Please log in again.');
		}

		const secret = this.configService.get('JWT_SECRET');
		if (!this.jwtService.verify(refreshToken, { secret })) {
			throw new UnauthorizedException('Invalid refresh token.');
		}

		const payload = { sub, username, role };
		const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');
		const accessToken = this.jwtService.sign(payload, {
			secret,
			expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRES_IN')}s`
		});
		refreshToken = this.jwtService.sign(payload, {
			secret,
			expiresIn: `${refreshTokenExpiresIn}s`
		});

		return new JwtTokenResponseDTO(sub, accessToken, refreshToken, refreshTokenExpiresIn);
	}
}
