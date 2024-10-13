import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {

    catch(exception: BadRequestException, host: ArgumentsHost): any {
        const response: Response = host.switchToHttp().getResponse();
        response.json({
            status: exception.getStatus(),
            message: exception.getResponse()['message']
        });
    }
}