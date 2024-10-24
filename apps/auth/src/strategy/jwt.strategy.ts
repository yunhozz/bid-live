import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../type/jwt-payload.type';
import { TUser } from '../type/user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => {
					return req.cookies?.['Access-Token'];
				}
			]),
			secretOrKey: configService.get('JWT_SECRET'),
			ignoreExpiration: true,
			passReqToCallback: true
		});
	}

	async validate(req: Request, payload: JwtPayload): Promise<TUser> {
		console.log(payload);
		if (payload && (await this.authService.validateJwtPayload(req, payload))) {
			return {
				sub: payload.sub,
				username: payload.username,
				role: payload.role
			};
		} else {
			throw new UnauthorizedException('Invalid token.');
		}
	}
}
