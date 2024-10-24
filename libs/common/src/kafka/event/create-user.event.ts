export class CreateUserEvent {
	readonly userId: number;
	readonly email: string;
	readonly name: string;
	readonly nickname: string;

	constructor(userId: number, email: string, name: string, nickname: string) {
		this.userId = userId;
		this.email = email;
		this.name = name;
		this.nickname = nickname;
	}
}
