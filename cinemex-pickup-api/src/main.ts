import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const logger_level_env = process.env.KEYCLOAK_LOG_LEVEL;
  const loggerLevels: LogLevel[] = logger_level_env
    ? (logger_level_env.split(',') as LogLevel[])
    : ['log'];
  

  const app = await NestFactory.create(AppModule, {
    logger: loggerLevels
  });

  //*Permitir CORS
  app.enableCors({
    // Permite que el frontend (puerto 5173) acceda al backend (puerto 5001)
    // Usamos '*' para permitir todos los orígenes en desarrollo, o puedes usar:
    // origin: 'http://localhost:5173', 
    origin: '*', 
    
    // Es CRUCIAL incluir el método PATCH para la actualización de ítems
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    
    // Necesario si usas cookies o sesiones, aunque no sea el caso ahora
    credentials: true, 
  });
  


  const logger = new Logger('Main');
  const port = process.env.PORT || 5001;
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    }),
  );

  await app.listen(port, '0.0.0.0');
  
  logger.log(`Server running on port: ${port}`);
}
bootstrap();
