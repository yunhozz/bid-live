import { PrismaService } from '@app/common/config/database/prisma/prisma.service';
import { RedisRepository } from '@app/common/config/database/redis/redis.repository';
import { Module } from '@nestjs/common';

@Module({
	providers: [PrismaService, RedisRepository],
	exports: [PrismaService, RedisRepository]
})
export class DatabaseModule {}
