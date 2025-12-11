import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

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
    .setTitle('Loomi Banking API Gateway')
    .setDescription(
      'Gateway central da API Loomi para microsserviços bancários. ' +
        'Fornece endpoints de autenticação e roteamento para os serviços de usuários e transações. ' +
        'Todas as requisições são protegidas por JWT e passam por validação rigorosa.',
    )
    .setVersion('1.0.0')
    .setContact('Equipe Loomi', 'https://loomi.com', 'suporte@loomi.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Ambiente de desenvolvimento')
    .addServer('https://api.loomi.com', 'Ambiente de produção')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Endpoints de autenticação - login, registro e renovação de tokens')
    .addTag('users', 'Gerenciamento de usuários - CRUD e dados bancários')
    .addTag('transactions', 'Gerenciamento de transações - transferências e histórico')
    .addTag('health', 'Verificações de saúde dos serviços')
    .addTag('metrics', 'Métricas de performance e monitoramento')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
