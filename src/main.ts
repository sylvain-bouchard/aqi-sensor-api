import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AqiPublisher } from './aqi/aqiPublisher';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('AQI Sensor Controller')
    .setDescription(
      'Welcome to air quality sensor remote controller API',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const aqiPublisher = app.get(AqiPublisher);
  aqiPublisher.start();

  await app.listen(3000);
}
bootstrap();
