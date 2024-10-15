import { ObjectId } from 'mongodb';

export class CreateUserEvent {
    readonly userId: ObjectId;
    readonly email: string;
    readonly name: string;
    readonly nickname: string;

    constructor(userId: ObjectId, email: string, name: string, nickname: string) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.nickname = nickname;
    }
}