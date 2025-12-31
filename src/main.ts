import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH',
  });

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Exam Portal API')
    .setDescription('AI-Powered Exam Portal with Automated Marking')
    .setVersion('1.0')
    .addBearerAuth() // JWT Bearer
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
