import { Page, PageRequest } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserResponseDTO } from './dto/response/user-response.dto';
import { UserRepository } from './persistence/repository/user.repository';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async findAllUsersOnPage(page: PageRequest): Promise<Page<UserResponseDTO>> {
		const found = await this.userRepository.findAll({}, page);
		const users = found.items.map((user) => new UserResponseDTO(user));
		return new Page(page.getLimit(), found.total, users);
	}

	async findUserDetails(userId: string): Promise<UserResponseDTO> {
		return this.userRepository.findOne({ _id: new ObjectId(userId) });
	}
}
