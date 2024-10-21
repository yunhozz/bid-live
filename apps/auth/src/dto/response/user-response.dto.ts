import { Role } from '@app/common';
import { User } from '../../persistence/schema/user.schema';
import { Provider } from '../../type/provider.type';

export class UserResponseDTO {
	readonly email: string;
	readonly name: string;
	readonly nickname: string;
	readonly age: number;
	readonly phoneNumber: string;
	readonly role: Role;
	readonly provider: Provider;

	constructor(user: User) {
		this.email = user.email;
		this.name = user.name;
		this.nickname = user.nickname;
		this.age = user.age;
		this.phoneNumber = user.phoneNumber;
		this.role = user.role;
		this.provider = user.provider;
	}
}
