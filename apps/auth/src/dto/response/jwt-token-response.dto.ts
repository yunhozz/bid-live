import { ObjectId } from 'mongodb';

export class JwtTokenResponseDTO {
	readonly sub: ObjectId;
	readonly accessToken: string;
	readonly refreshToken: string;
	readonly accessTokenExpires: number;
	readonly refreshTokenExpires: number;

	constructor(
		sub: ObjectId,
		accessToken: string,
		refreshToken: string,
		accessTokenExpires: number,
		refreshTokenExpires: number
	) {
		this.sub = sub;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.accessTokenExpires = accessTokenExpires;
		this.refreshTokenExpires = refreshTokenExpires;
	}
}
