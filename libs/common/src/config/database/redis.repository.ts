import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisRepository {
	private readonly redis: Redis;

	constructor(private readonly configService: ConfigService) {
		const redisConfig = {
			host: configService.get('REDIS_HOST'),
			port: configService.get('REDIS_PORT')
		};
		this.redis = new Redis(redisConfig);
	}

	async get(key: string): Promise<string | null> {
		return this.redis.get(key);
	}

	async set(key: string, value: string, ttl?: number): Promise<void> {
		ttl ? this.redis.set(key, value, 'EX', ttl) : this.redis.set(key, value);
	}

	async delete(key: any): Promise<void> {
		const value = await this.get(key);
		if (value) {
			this.redis.set(key, value, 'PX', 1);
		}
	}
}
