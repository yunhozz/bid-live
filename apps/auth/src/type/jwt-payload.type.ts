import { TRole } from '@app/common';
import { ObjectId } from 'mongodb';

export type JwtPayload = {
	sub: ObjectId;
	username: string;
	role: TRole;
	iat: number;
	exp: number;
};
