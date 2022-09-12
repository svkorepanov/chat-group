import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'log', 'warn']
        : ['debug', 'error', 'log', 'warn', 'verbose'],
  });
  await app.listen(3000);
}
bootstrap();

// it's needed for being able to terminate application by pressing Ctrl+C
process.on('SIGINT', function () {
  process.exit();
});
