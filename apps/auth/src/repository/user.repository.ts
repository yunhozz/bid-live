import { PrismaRepository, PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends PrismaRepository<'user'> {
	constructor(private readonly prismaService: PrismaService) {
		super(prismaService, 'user');
	}
}
