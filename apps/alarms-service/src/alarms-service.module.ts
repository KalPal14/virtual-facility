import { Module } from '@nestjs/common';
import { AlarmsServiceController } from './alarms-service.controller';

@Module({
  imports: [],
  controllers: [AlarmsServiceController],
})
export class AlarmsServiceModule {}
