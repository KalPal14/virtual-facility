import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WORKFLOWS_SERVICE } from '../constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outbox } from './entities/outbox.entity';
import { OutboxProcessor } from './outbox.processor';
import { OutboxEventSubscriber } from './outbox.event-subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outbox]),
    ClientsModule.register([
      {
        name: WORKFLOWS_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'workflows-service',
        },
      },
    ]),
  ],
  providers: [OutboxService, OutboxProcessor, OutboxEventSubscriber],
})
export class OutboxModule {}
