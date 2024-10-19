import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		const ctx = context.switchToHttp();
		const request: Request = ctx.getRequest();
		const response: Response = ctx.getResponse();

		return next.handle().pipe(
			tap(() => {
				const token = request['New-Token'];
				if (token) {
					response.setHeader('Authorization', `Bearer ${token}`);
				}
			})
		);
	}
}
