import { UserPassword } from '../persistence/schema/user-password.schema';
import { User } from '../persistence/schema/user.schema';

export type TUser = Omit<User, '_id' | 'role'>;

export type TUserPassword = Omit<UserPassword, '_id'>;
