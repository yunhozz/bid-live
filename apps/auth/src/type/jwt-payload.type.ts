import { Role } from '@app/common';
import { ObjectId } from 'mongodb';

export type JwtPayload = {
	sub: ObjectId;
	username: string;
	role: Role;
	iat: number;
	exp: number;
};

export type JwtUser = Omit<JwtPayload, 'iat' | 'exp'>;
