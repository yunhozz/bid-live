import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator((key: string | undefined, ctx: ExecutionContext) => {
	const req: Request = ctx.switchToHttp().getRequest();
	return key ? req.user[key] : req.user;
});
