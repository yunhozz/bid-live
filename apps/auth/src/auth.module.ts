import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserPasswordRepository } from './persistence/repository/user-password.repository';
import { UserRepository } from './persistence/repository/user.repository';
import { UserPassword, UserPasswordSchema } from './persistence/schema/user-password.schema';
import { User, UserSchema } from './persistence/schema/user.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                SERVICE_PORT: Joi.number().required(),
                MONGODB_URI: Joi.string().required(),
                JWT_SECRET: Joi.string().required(),
                JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
                JWT_REFRESH_EXPIRES_IN: Joi.string().required()
            }),
            envFilePath: "./apps/auth/.env"
        }),
        DatabaseModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserPassword.name, schema: UserPasswordSchema }
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get("JWT_SECRET"),
                signOptions: {
                    expiresIn: `${configService.get("JWT_ACCESS_EXPIRES_IN")} + s`,
                }
            })
        }),
        PassportModule.register({ defaultStrategy: "jwt" })
    ],
    controllers: [AuthController],
    providers: [AuthService, UserRepository, UserPasswordRepository]
})
export class AuthModule {}