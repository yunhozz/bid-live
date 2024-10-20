import { Page, PageRequest, ROLE, Roles, RolesGuard } from '@app/common';
import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
@UseGuards(AuthGuard(), RolesGuard)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('/users')
	@Roles(ROLE.admin)
	async lookupUsers(
		@Query('page') page: string = '1',
		@Query('limit') limit: string = '10'
	): Promise<Page<any>> {
		const pageRequest = new PageRequest(parseInt(page), parseInt(limit));
		return await this.authService.findAllUsersOnPage(pageRequest);
	}

	@Get('/users/:id')
	@Roles(ROLE.admin)
	async lookupUserDetails(@Param('id') id: string): Promise<any> {
		return this.authService.findUserDetails(id);
	}

	@Delete('/logout')
	async signOut(): Promise<any> {}

	@Delete('/withdraw')
	async withdraw(): Promise<any> {}
}
