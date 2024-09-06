import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Inbox } from './entities/inbox.entity';

@Injectable()
export class InboxService {
  constructor(private readonly dataSorce: DataSource) {}

  async processInboxMessages(
    process: (messages: Inbox[], manager: EntityManager) => Promise<unknown>,
    options: { take: number },
  ) {
    return this.dataSorce.transaction(async (manadger) => {
      const inboxRepository = manadger.getRepository(Inbox);
      const messages = await inboxRepository.find({
        where: { status: 'pending' },
        order: { createdAt: 'ASC' },
        take: options.take,
        lock: {
          mode: 'pessimistic_write',
          onLocked: 'nowait',
        },
      });
      await process(messages, manadger);
    });
  }
}
