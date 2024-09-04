import { NestFactory } from '@nestjs/core';
import { AlarmsGeneratorModule } from './alarms-generator.module';

async function bootstrap() {
  // !!! createApplicationContext insted create
  NestFactory.createApplicationContext(AlarmsGeneratorModule);
}
bootstrap();
