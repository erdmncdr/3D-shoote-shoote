import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GameServer } from './modules/game/game.server';
import { validateEnvironment } from './config/env.validation';

async function bootstrap() {
  try {
    // Validate environment variables before starting
    const env = validateEnvironment();

    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.listen(env.PORT);

    // Get the underlying HTTP server
    const httpServer = app.getHttpServer();

    // Initialize Colyseus game server
    const gameServer = new GameServer(httpServer);

    console.log(`🚀 Server is running on: http://localhost:${env.PORT}`);
    console.log(`🎮 Game server (Colyseus) is running on ws://localhost:${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received, starting graceful shutdown...`);

      try {
        // Close game server first
        await gameServer.gracefulShutdown();
        console.log('✅ Game server closed');

        // Close HTTP server
        await app.close();
        console.log('✅ HTTP server closed');

        console.log('👋 Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
