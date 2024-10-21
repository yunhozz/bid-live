import { setCookie } from '@app/common/utils/cookie.utils';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Observable<any> | Promise<Observable<any>> {
		const ctx = context.switchToHttp();
		const req: Request = ctx.getRequest();
		const res: Response = ctx.getResponse();

		return next.handle().pipe(
			tap(async () => {
				const token = req['New-Token'];
				if (token) {
					await setCookie(res, 'Access-Token', token, { path: '/' });
				}
			})
		);
	}
}
