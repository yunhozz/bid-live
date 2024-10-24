import { Provider, Role, User } from '@prisma/client';

export class UserResponseDTO {
	readonly id: number;
	readonly email: string;
	readonly name: string;
	readonly nickname: string;
	readonly age: number;
	readonly phoneNumber: string;
	readonly role?: Role;
	readonly provider?: Provider;

	constructor(user: User) {
		this.id = user.id;
		this.email = user.email;
		this.name = user.name;
		this.nickname = user.nickname;
		this.age = user.age;
		this.phoneNumber = user.phoneNumber;
		this.role = user.role ?? undefined;
		this.provider = user.provider ?? undefined;
	}
}
