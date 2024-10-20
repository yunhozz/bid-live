import { Page, PageRequest } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserPasswordRepository } from './persistence/repository/user-password.repository';
import { UserRepository } from './persistence/repository/user.repository';
import { User } from './persistence/schema/user.schema';
import { TUser } from './type/user.type';

@Injectable()
export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly userPasswordRepository: UserPasswordRepository
	) {}

	async findAllUsersOnPage(page: PageRequest): Promise<Page<TUser>> {
		const found = await this.userRepository.findAll({}, page);
		return new Page(page.getLimit(), found.total, found.items);
	}

	async findUserDetails(id: string): Promise<User> {
		return await this.userRepository.findOne({ _id: new ObjectId(id) });
	}
}
