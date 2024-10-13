import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

    catch(exception: HttpException, host: ArgumentsHost): any {
        const response: Response = host.switchToHttp().getResponse();
        response.json({
            status: exception.getStatus(),
            message: exception.message
        });
    }
}