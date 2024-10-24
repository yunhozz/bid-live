import {
	DatabaseModule,
	GlobalExceptionFilter,
	KafkaClientModule,
	PipeInterceptor,
	PrismaExceptionFilter,
	TokenInterceptor
} from '@app/common';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import Joi from 'joi';
import { AuthController } from './controller/auth.controller';
import { UserController } from './controller/user.controller';
import { UserPasswordRepository } from './repository/user-password.repository';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				SERVICE_PORT: Joi.number().required(),
				POSTGRES_URI: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
				JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
				REDIS_HOST: Joi.string().required(),
				REDIS_PORT: Joi.number().required()
			}),
			envFilePath: './apps/auth/.env'
		}),
		DatabaseModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
				signOptions: {
					expiresIn: `${configService.get('JWT_ACCESS_EXPIRES_IN')}s`
				}
			})
		}),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		KafkaClientModule
	],
	controllers: [AuthController, UserController],
	providers: [
		{ provide: APP_FILTER, useClass: GlobalExceptionFilter },
		{ provide: APP_FILTER, useClass: PrismaExceptionFilter },
		{ provide: APP_PIPE, useClass: ValidationPipe },
		{ provide: APP_INTERCEPTOR, useClass: PipeInterceptor },
		{ provide: APP_INTERCEPTOR, useClass: TokenInterceptor },
		AuthService,
		UserService,
		UserRepository,
		UserPasswordRepository,
		JwtStrategy
	]
})
export class AuthModule {}
