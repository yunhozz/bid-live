import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
	extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
	implements OnModuleInit
{
	private readonly logger = new Logger(PrismaService.name);

	constructor(private readonly configService: ConfigService) {
		super({
			log: [
				{
					level: 'query',
					emit: 'event'
				},
				{
					level: 'error',
					emit: 'event'
				},
				{
					level: 'warn',
					emit: 'stdout'
				},
				{
					level: 'info',
					emit: 'stdout'
				}
			]
		});
	}

	async onModuleInit() {
		if (this.configService.get('NODE_ENV') == 'dev') {
			this.$on('query', (event: { query: any; duration: any }) => {
				this.logger.verbose(event.query, event.duration);
			});
		}

		this.$on('error', (event: { target: any }) => {
			this.logger.verbose(event.target);
		});

		await this.$connect();
	}
}
