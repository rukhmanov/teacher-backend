import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Файлы теперь хранятся в S3, статическая раздача не нужна

  // Enable CORS
  // Список разрешенных доменов фронтенда
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'https://rukhmanov-teacher-frontend-b1d8.twc1.net',
    'http://rukhmanov-teacher-frontend-b1d8.twc1.net',
  ].filter(Boolean); // Убираем undefined значения

  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, от Postman, мобильных приложений)
      if (!origin) {
        return callback(null, true);
      }
      
      // Проверяем, есть ли origin в списке разрешенных
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra properties for now
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        return new ValidationPipe().createExceptionFactory()(errors);
      },
    }),
  );

  // Seed database
  try {
    const dataSource = app.get(DataSource);
    await seedDatabase(dataSource);
  } catch (error) {
    console.error('Error seeding database:', error);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
