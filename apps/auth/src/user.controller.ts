import { Page, PageRequest, ROLE, Roles, RolesGuard } from '@app/common';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard(), RolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@Roles(ROLE.admin)
	async lookupUsers(
		@Query('page') page: string = '1',
		@Query('limit') limit: string = '10'
	): Promise<Page<any>> {
		const pageRequest = new PageRequest(parseInt(page), parseInt(limit));
		return await this.userService.findAllUsersOnPage(pageRequest);
	}

	@Get('/:id')
	@Roles(ROLE.admin)
	async lookupUserDetails(@Param('id') id: string): Promise<any> {
		return this.userService.findUserDetails(id);
	}
}
