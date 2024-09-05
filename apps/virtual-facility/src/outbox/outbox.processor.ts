import { ClientProxy, RmqRecord } from '@nestjs/microservices';
import { WORKFLOWS_SERVICE } from '../constants';
import { Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Outbox } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { OutboxService } from './outbox.service';
import { lastValueFrom } from 'rxjs';

export class OutboxProcessor {
  logger = new Logger();

  constructor(
    private readonly outboxService: OutboxService,
    @Inject(WORKFLOWS_SERVICE) private readonly workflowsService: ClientProxy,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxMessages() {
    this.logger.debug(`Processing outbox messages`);
    const messages = await this.outboxService.getUnprocessetMessages({
      target: WORKFLOWS_SERVICE.description,
      take: 100,
    });
    await Promise.all(
      messages.map(async (message) => {
        await this.dispatchWorkflowEvent(message);
        // Instead of removing the message from the database, we could also update the message status to "processed".
        // However, for simplicity sake, we'll just remove the message from the database.
        await this.outboxRepository.remove(message);
      }),
    );
  }

  async dispatchWorkflowEvent(outbox: Outbox) {
    const rmqRecord = new RmqRecord(outbox.payload, {
      messageId: String(outbox.id),
    });
    await lastValueFrom(this.workflowsService.emit(outbox.type, rmqRecord));
  }
}
