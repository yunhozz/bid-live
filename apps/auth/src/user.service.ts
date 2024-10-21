import { Page, PageRequest } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserRepository } from './persistence/repository/user.repository';
import { User } from './persistence/schema/user.schema';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async findAllUsersOnPage(page: PageRequest): Promise<Page<User>> {
		const found = await this.userRepository.findAll({}, page);
		return new Page(page.getLimit(), found.total, found.items);
	}

	async findUserDetails(id: string): Promise<User> {
		return await this.userRepository.findOne({ _id: new ObjectId(id) }, 'userPassword');
	}
}
