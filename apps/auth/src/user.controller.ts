import { Body, Controller, Post } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from './dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from './dto/response/jwt-token-response.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('/sign-up')
	async signUp(@Body() dto: CreateUserRequestDTO): Promise<ObjectId> {
		return await this.userService.createUser(dto);
	}

	@Post('/sign-in')
	async signIn(@Body() dto: UserLoginRequestDTO): Promise<JwtTokenResponseDTO> {
		return await this.userService.loginUser(dto);
	}
}
