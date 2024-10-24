import { CookieName, GetUser, removeCookie, setCookie } from '@app/common';
import { Body, Controller, Delete, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CreateUserRequestDTO } from '../dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from '../dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from '../dto/response/jwt-token-response.dto';
import { AuthService } from '../service/auth.service';
import { TUser } from '../type/user.type';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('/sign-up')
	async signUp(@Body() dto: CreateUserRequestDTO): Promise<number> {
		return await this.authService.createUser(dto);
	}

	@Post('/sign-in')
	async signIn(
		@Body() dto: UserLoginRequestDTO,
		@Res({ passthrough: true }) res: Response
	): Promise<JwtTokenResponseDTO> {
		const tokenResponseDTO = await this.authService.loginUser(dto);
		await setCookie(res, CookieName.accessToken, tokenResponseDTO.accessToken, { path: '/' });

		return tokenResponseDTO;
	}

	@Delete('/logout')
	@UseGuards(AuthGuard())
	async signOut(
		@GetUser('username') username: string,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		await Promise.all([
			this.authService.logoutUser(username),
			removeCookie(res, CookieName.accessToken, { path: '/' })
		]);
	}

	@Delete('/withdraw')
	@UseGuards(AuthGuard())
	async withdraw(
		@GetUser() user: TUser,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		await Promise.all([
			this.authService.withdrawUser(user.sub, user.username),
			removeCookie(res, CookieName.accessToken, { path: '/' })
		]);
	}
}
