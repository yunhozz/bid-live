import { Page, PageRequest, Role, Roles, RolesGuard } from '@app/common';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserResponseDTO } from './dto/response/user-response.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard(), RolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@Roles(Role.admin)
	async lookupUsers(
		@Query('page') page: string = '1',
		@Query('limit') limit: string = '10'
	): Promise<Page<UserResponseDTO>> {
		const pageRequest = new PageRequest(parseInt(page), parseInt(limit));
		return await this.userService.findAllUsersOnPage(pageRequest);
	}

	@Get('/:id')
	@Roles(Role.admin)
	async lookupUserDetails(@Param('id') id: string): Promise<UserResponseDTO> {
		return this.userService.findUserDetails(id);
	}
}
