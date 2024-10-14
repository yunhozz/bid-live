import { Page, PageRequest, role, Roles, RolesGuard } from '@app/common';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthService } from './auth.service';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from './dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from './dto/response/jwt-token-response.dto';
import { TUser } from './type/user.type';

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

    @Get("/users")
    @UseGuards(RolesGuard)
    @Roles(role.admin)
    async lookupUsers(
        @Query("page") page: string = "1",
        @Query("limit") limit: string = "10"
    ): Promise<Page<TUser>> {
        const pageRequest = new PageRequest(parseInt(page), parseInt(limit));
        return await this.authService.findAllUsersOnPage(pageRequest);
    }
}