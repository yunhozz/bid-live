import { DatabaseModule, GlobalExceptionFilter, PipeInterceptor } from '@app/common';
import { KafkaClientModule } from '@app/common/kafka/kafka-client.module';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
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
                    expiresIn: `${configService.get("JWT_ACCESS_EXPIRES_IN")}s`,
                }
            })
        }),
        PassportModule.register({ defaultStrategy: "jwt" }),
        KafkaClientModule
    ],
    controllers: [AuthController],
    providers: [
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
        { provide: APP_PIPE, useClass: ValidationPipe },
        { provide: APP_INTERCEPTOR, useClass: PipeInterceptor },
        AuthService,
        UserRepository,
        UserPasswordRepository
    ]
})
export class AuthModule {}