import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserPasswordRepository } from './persistence/repository/user-password.repository';
import { UserRepository } from './persistence/repository/user.repository';
import { UserPassword } from './persistence/schema/user-password.schema';
import { User } from './persistence/schema/user.schema';
import { TUserPassword } from './type/user-password.type';
import { TUser } from './type/user.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userPasswordRepository: UserPasswordRepository
    ) {}

    async createUser(dto: CreateUserRequestDTO): Promise<ObjectId> {
        const user: TUser = {
            email: dto.email,
            name: dto.name,
            nickname: dto.nickname,
            age: dto.age,
            phoneNumber: dto.phoneNumber
        };

        const userSchema = plainToInstance(User, user);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const password: TUserPassword = {
            user: userSchema,
            password: hashedPassword,
            salt
        };

        const createdUser = await this.userRepository.create(userSchema);
        await this.userPasswordRepository.create(plainToInstance(UserPassword, password));

        return createdUser._id;
    }
}