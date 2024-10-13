import { HttpExceptionFilter, PipeInterceptor, ValidationExceptionFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter(), new ValidationExceptionFilter());
    app.useGlobalInterceptors(new PipeInterceptor());

    const configService = app.get(ConfigService);
    const port = configService.get("SERVICE_PORT");
    await app.listen(port);
}
bootstrap();