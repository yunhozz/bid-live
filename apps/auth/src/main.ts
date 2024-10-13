import { CustomExceptionFilter, PipeInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    app.useGlobalFilters(new CustomExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new PipeInterceptor());

    const configService = app.get(ConfigService);
    const port = configService.get("SERVICE_PORT");
    await app.listen(port);
}
bootstrap();