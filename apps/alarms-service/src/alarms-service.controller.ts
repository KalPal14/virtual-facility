import { Body, Controller, Get, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AlarmsServiceController {
  logger = new Logger();

  @EventPattern('alarms.create')
  @Get()
  getHello(@Body() data: unknown) {
    this.logger.debug(
      `Alarms.create event received with data: ${JSON.stringify(data)}`,
    );
  }
}
