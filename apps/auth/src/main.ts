import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { AuthModule } from './auth.module';

async function bootstrap() {
	const app = await NestFactory.create(AuthModule);
	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.KAFKA,
		options: {
			client: {
				brokers: ['localhost:9092']
			},
			consumer: {
				groupId: 'auth'
			}
		}
	});
	const configService = app.get(ConfigService);
	const port = configService.get('SERVICE_PORT');

	app.use(cookieParser());
	await app.startAllMicroservices();
	await app.listen(port);
}
bootstrap();
