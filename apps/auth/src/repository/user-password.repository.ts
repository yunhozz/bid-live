import { PrismaRepository, PrismaService } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserPasswordRepository extends PrismaRepository<'userPassword'> {
	constructor(private readonly prismaService: PrismaService) {
		super(prismaService, 'userPassword');
	}
}
