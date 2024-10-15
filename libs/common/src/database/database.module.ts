import { RedisRepository } from '@app/common/database/redis.repository';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGODB_URI')
			})
		})
	],
	providers: [RedisRepository],
	exports: [RedisRepository]
})
export class DatabaseModule {}
