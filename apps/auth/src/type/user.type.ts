import { ObjectId } from 'mongodb';
import { User } from '../persistence/schema/user.schema';

export type TUser = Omit<User, '_id' | 'role'>;

export type TUserPassword = {
	userId: ObjectId;
	password: string;
	salt: string;
};
