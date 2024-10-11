import { Body, Controller, Post } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthService } from './auth.service';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from './dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from './dto/response/jwt-token-response.dto';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post("/sign-up")
    async signUp(@Body() dto: CreateUserRequestDTO): Promise<ObjectId> {
        return await this.authService.createUser(dto);
    }

    @Post("/sign-in")
    async signIn(@Body() dto: UserLoginRequestDTO): Promise<JwtTokenResponseDTO> {
        return await this.authService.loginUser(dto);
    }
}