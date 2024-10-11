import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ObjectId } from 'mongodb';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class TokenPayload {
    readonly sub: ObjectId;
    readonly username: string;
    readonly role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get("JWT_SECRET")
        });
    }

    async validate(jwtPayload: Request): Promise<TokenPayload> {
        // jwtPayload = { sub, username, roles, iat, ext }
        const sub = jwtPayload['sub'];
        const username = jwtPayload['username'];
        const role = jwtPayload['roles'];

        return { sub, username, role };
    }
}