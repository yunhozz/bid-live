import { User } from '../persistence/schema/user.schema';

export type TUserPassword = {
    user: User;
    password: string;
    salt: string;
}