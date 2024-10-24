import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	InternalServerErrorException
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: InternalServerErrorException | Error, host: ArgumentsHost): any {
		const ctx = host.switchToHttp();
		const request: Request = ctx.getRequest();
		const response: Response = ctx.getResponse();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const responseMessage = (type: string, message: string) => {
			response.status(status).json({
				statusCode: status,
				path: request.url,
				errorType: type,
				errorMessage: message
			});
		};

		if (exception instanceof HttpException) {
			const errorResponse = exception.getResponse();
			const message =
				typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message || exception.message;
			responseMessage(exception.name, message);
		} else if (exception instanceof Error) {
			responseMessage(exception.name, exception.message || 'An unexpected error occurred');
		} else {
			responseMessage('Unknown Error', 'An unexpected error occurred');
		}
	}
}
