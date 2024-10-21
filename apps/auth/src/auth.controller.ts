import { GetUser, removeCookie, setCookie } from '@app/common';
import { Body, Controller, Delete, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthService } from './auth.service';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from './dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from './dto/response/jwt-token-response.dto';
import { TUser } from './type/user.type';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('/sign-up')
	async signUp(@Body() dto: CreateUserRequestDTO): Promise<ObjectId> {
		return await this.authService.createUser(dto);
	}

	@Post('/sign-in')
	async signIn(
		@Body() dto: UserLoginRequestDTO,
		@Res({ passthrough: true }) res: Response
	): Promise<JwtTokenResponseDTO> {
		const tokenResponseDTO = await this.authService.loginUser(dto);
		await setCookie(res, 'access-token', tokenResponseDTO.accessToken, {
			path: '/',
			maxAge: tokenResponseDTO.accessTokenExpires
		});

		return tokenResponseDTO;
	}

	@Delete('/logout')
	async signOut(@Res({ passthrough: true }) res: Response): Promise<void> {
		await removeCookie(res, 'access-token', { path: '/' });
	}

	@Delete('/withdraw')
	@UseGuards(AuthGuard())
	async withdraw(
		@GetUser() user: TUser,
		@Res({ passthrough: true }) res: Response
	): Promise<void> {
		await this.authService.withdrawUser(user.sub, user.username);
		await removeCookie(res, 'access-token', { path: '/' });
	}
}
