import { ObjectId } from 'mongodb';

export class JwtTokenResponseDTO {
    readonly sub: ObjectId;
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly refreshTokenExpires: number;

    constructor(sub: ObjectId, accessToken: string, refreshToken: string, refreshTokenExpires: number) {
        this.sub = sub;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.refreshTokenExpires = refreshTokenExpires;
    }
}