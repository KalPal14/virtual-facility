import { Inject, Injectable } from '@nestjs/common';
import { ALARMS_SERVICE } from './constants';
import { ClientProxy } from '@nestjs/microservices';
// import { Interval } from '@nestjs/schedule';

@Injectable()
export class AlarmsGeneratorService {
  constructor(
    @Inject(ALARMS_SERVICE) private readonly alarmsService: ClientProxy,
  ) {}

  // @Interval(10000)
  generateAlarm() {
    this.alarmsService.emit('alarms.create', {
      name: `ALARM # ${Math.floor(Math.random() * 1000 + 1)}`,
    });
  }
}
