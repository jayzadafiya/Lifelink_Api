import helmet from 'helmet';
import * as hpp from 'hpp';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as xss from 'xss-clean';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from '../shared/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors();
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  app.use(helmet());
  app.use(hpp());
  app.use(mongoSanitize());
  app.use(xss());

  await app.listen(4000);
}
bootstrap();
