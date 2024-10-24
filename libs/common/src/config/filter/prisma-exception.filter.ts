import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientUnknownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(
		exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError,
		host: ArgumentsHost
	): any {
		const ctx = host.switchToHttp();
		const req: Request = ctx.getRequest();
		const res: Response = ctx.getResponse();
		let message: string;
		let status: number;

		message = exception.message.replace(/\n/g, '');

		if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			switch (exception.code) {
				case 'P2002':
					status = HttpStatus.CONFLICT;
					break;
				case 'P2003':
				case 'P2014':
					status = HttpStatus.BAD_REQUEST;
					break;
				case 'P2025':
					status = HttpStatus.NOT_FOUND;
					break;
				default:
					status = HttpStatus.INTERNAL_SERVER_ERROR;
					message = `${exception.code} : ${exception.message.replace(/\n/g, '')}`;
			}
		} else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
		}

		res.status(status).json({
			statusCode: status,
			path: req.url,
			message
		});
	}
}
