import { Body, Controller, Post } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthService } from './auth.service';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post("/sign-up")
    async signUp(@Body() dto: CreateUserRequestDTO): Promise<ObjectId> {
        return await this.authService.createUser(dto);
    }
}