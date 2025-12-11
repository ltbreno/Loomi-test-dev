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
    .setTitle('Users Service API')
    .setDescription(
      'Serviço de gerenciamento de usuários do sistema bancário Loomi. ' +
        'Responsável pelo CRUD de usuários, dados bancários, perfis e saldos. ' +
        'Inclui funcionalidades de cache Redis para otimização de performance.',
    )
    .setVersion('1.0.0')
    .setContact('Equipe de Desenvolvimento', 'https://loomi.com', 'dev@loomi.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Ambiente de desenvolvimento')
    .addServer('https://users.loomi.com', 'Ambiente de produção')
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
    .addTag('users', 'Operações de usuários - criação, consulta, atualização e perfil')
    .addTag('balance', 'Consultas de saldo da conta')
    .addTag('health', 'Verificações de saúde do serviço')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Users Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
