import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: false,
  });
  app.enableCors({
    origin: ['https://testtrack-frontend.vercel.app', 'http://localhost:5173'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.init();
  return server;
}

const bootstrapPromise = bootstrap();

export default async function handler(req, res) {
  const app = await bootstrapPromise;
  app(req, res);
}
