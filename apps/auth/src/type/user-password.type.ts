import { Types } from 'mongoose';

export type TUserPassword = {
    userId: Types.ObjectId;
    password: string;
    salt: string;
}