import { Injectable, NotFoundException } from '@nestjs/common';
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

	async get(key: string): Promise<string> {
		const value = this.redis.get(key);
		if (!value) {
			throw new NotFoundException(`There is no data for this key : ${key}`);
		}
		return value;
	}

	async set(key: string, value: string, ttl?: number): Promise<void> {
		ttl ? this.redis.set(key, value, 'EX', ttl) : this.redis.set(key, value);
	}

	async delete(key: any): Promise<void> {
		const value = await this.get(key);
		this.redis.set(key, value, 'PX', 1);
	}
}
