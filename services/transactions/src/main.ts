import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Transactions Service API')
    .setDescription(
      'Serviço de processamento de transações financeiras do sistema bancário Loomi. ' +
        'Gerencia transferências entre usuários, histórico de transações e reversões. ' +
        'Utiliza Apache Kafka para comunicação assíncrona e processamento confiável.',
    )
    .setVersion('1.0.0')
    .setContact('Equipe de Desenvolvimento', 'https://loomi.com', 'dev@loomi.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3002', 'Ambiente de desenvolvimento')
    .addServer('https://transactions.loomi.com', 'Ambiente de produção')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT de autenticação',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('transactions', 'Operações de transações - criação, consulta, histórico e reversão')
    .addTag('health', 'Verificações de saúde do serviço')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 Transactions Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
