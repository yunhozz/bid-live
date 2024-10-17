import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { UserRepository } from '../persistence/repository/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('JWT_SECRET')
		});
	}

	async validate(jwtPayload: any, done: VerifiedCallback): Promise<any> {
		console.log(jwtPayload);
		const sub = jwtPayload['sub'];
		const user = await this.userRepository.findOne({ _id: sub });

		return done(null, user);
	}
}
