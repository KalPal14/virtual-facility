import { Body, Controller, Get, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { MESSAGE_BROKER } from './constants';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AlarmsServiceController {
  logger = new Logger();

  constructor(
    @Inject(MESSAGE_BROKER) private readonly messageBroker: ClientProxy,
  ) {}

  @EventPattern('alarms.create')
  @Get()
  async getHello(@Body() data: { name: string }) {
    this.logger.debug(
      `Alarms.create event received with data: ${JSON.stringify(data)}`,
    );

    const alarmClassification = await lastValueFrom(
      this.messageBroker.send('alarm.classify', data),
    );
    this.logger.debug(
      `Alarm "${data.name}" classified as ${alarmClassification.category}`,
    );

    const notify = this.messageBroker.emit(
      'notification.send',
      alarmClassification,
    );
    await lastValueFrom(notify);
    this.logger.debug(`Dispatched "notification.send" event`);
  }
}
