import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
	(cookieName: string, ctx: ExecutionContext): string | undefined => {
		const req: Request = ctx.switchToHttp().getRequest();
		return req.cookies?.[cookieName];
	}
);
