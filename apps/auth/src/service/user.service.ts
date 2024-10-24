import { Page, PageRequest } from '@app/common';
import { Injectable } from '@nestjs/common';
import { UserResponseDTO } from '../dto/response/user-response.dto';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async findAllUsersOnPage(page: PageRequest): Promise<Page<UserResponseDTO>> {
		const [users, total] = await Promise.all([
			this.userRepository.findMany({
				select: {
					id: true,
					email: true,
					name: true,
					nickname: true,
					age: true,
					phoneNumber: true
				},
				skip: page.getOffset(),
				take: page.getLimit(),
				orderBy: { id: 'desc' }
			}),
			this.userRepository.count()
		]);

		return new Page(
			page.getLimit(),
			total,
			users.map((user) => new UserResponseDTO(user))
		);
	}

	async findUserDetails(userId: number): Promise<UserResponseDTO> {
		const user = await this.userRepository.findUniqueOrThrow({
			where: { id: userId }
		});

		return new UserResponseDTO(user);
	}
}
