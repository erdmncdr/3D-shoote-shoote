import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GameServer } from './modules/game/game.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Get the underlying HTTP server
  const httpServer = app.getHttpServer();

  // Initialize Colyseus game server
  new GameServer(httpServer);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`🎮 Game server (Colyseus) is running on ws://localhost:${port}`);
}

bootstrap();
