import { PrismaService } from '@app/common/config/database/prisma/prisma.service';
import { RedisRepository } from '@app/common/config/database/redis/redis.repository';
import { Module } from '@nestjs/common';

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
