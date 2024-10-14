import { CreateUserEvent, ProducerService } from '@app/common';
import { TokenPayload } from '@app/common/strategy/jwt.strategy';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { CreateUserRequestDTO } from './dto/request/create-user-request.dto';
import { UserLoginRequestDTO } from './dto/request/user-login-request.dto';
import { JwtTokenResponseDTO } from './dto/response/jwt-token-response.dto';
import { UserPasswordRepository } from './persistence/repository/user-password.repository';
import { UserRepository } from './persistence/repository/user.repository';
import { UserPassword } from './persistence/schema/user-password.schema';
import { User } from './persistence/schema/user.schema';
import { Role } from './type/role.type';
import { TUserPassword } from './type/user-password.type';
import { TUser } from './type/user.type';


@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userPasswordRepository: UserPasswordRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly producerService: ProducerService
    ) {}

    async createUser(dto: CreateUserRequestDTO): Promise<ObjectId> {
        const email = dto.email;

        if (await this.userRepository.exists({ email })) {
            throw new BadRequestException(`A duplicate email exists : ${email}`);
        }

        const user: TUser = {
            email,
            name: dto.name,
            nickname: dto.nickname,
            age: dto.age,
            phoneNumber: dto.phoneNumber
        };

        const userSchema = plainToInstance(User, user);
        const createdUser = await this.userRepository.create(userSchema);

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const userPassword: TUserPassword = {
            userId: createdUser._id,
            password: hashedPassword,
            salt
        };

        await this.userPasswordRepository.create(plainToInstance(UserPassword, userPassword));

        await this.producerService.produce({
            topic: "create-user-topic",
            messages: [
                {
                    value: JSON.stringify(new CreateUserEvent(
                        createdUser._id,
                        createdUser.email,
                        createdUser.name,
                        createdUser.nickname
                    ))
                }
            ]
        });

        return createdUser._id;
    }

    async loginUser(dto: UserLoginRequestDTO): Promise<JwtTokenResponseDTO> {
        const user = await this.userRepository.findOne({ email: dto.email });

        if (user) {
            const userPassword = await this.userPasswordRepository.findOne({ userId: user._id });
            if (userPassword && await bcrypt.compare(dto.password, userPassword.password)) {
                return await this.generateJwtTokens(user._id, user.email, user.role);
            } else {
                throw new UnauthorizedException('Please check your password again.');
            }
        } else {
            throw new UnauthorizedException(`User Not Found : ${dto.email}`);
        }
    }

    private async generateJwtTokens(sub: ObjectId, username: string, role: Role): Promise<JwtTokenResponseDTO> {
        const payload: TokenPayload = { sub, username, role };
        const secret = this.configService.get("JWT_SECRET");
        const accessTokenExpiresIn = this.configService.get("JWT_ACCESS_EXPIRES_IN");
        const refreshTokenExpiresIn = this.configService.get("JWT_REFRESH_EXPIRES_IN");

        const accessToken = this.jwtService.sign(payload, {
            secret,
            expiresIn: accessTokenExpiresIn
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret,
            expiresIn: refreshTokenExpiresIn
        });

        return new JwtTokenResponseDTO(
            sub,
            accessToken,
            refreshToken,
            refreshTokenExpiresIn
        );
    }
}