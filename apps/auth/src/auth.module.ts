import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common';
import Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                MONGODB_URI: Joi.string().required()
            }),
            envFilePath: "./apps/auth/.env"
        }),
        DatabaseModule
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}