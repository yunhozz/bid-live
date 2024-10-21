import { JwtPayload } from './jwt-payload.type';

export type TUser = Omit<JwtPayload, 'iat' | 'exp'>;

export type GoogleUser = {
	email: string;
	firstName: string;
	lastName: string;
};

export type KakaoUser = {
	email: string;
};

export type NaverUser = {
	email: string;
};
