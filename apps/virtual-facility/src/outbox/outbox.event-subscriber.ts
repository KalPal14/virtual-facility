import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Outbox } from './entities/outbox.entity';
import { OutboxProcessor } from './outbox.processor';

@EventSubscriber()
export class OutboxEventSubscriber
  implements EntitySubscriberInterface<Outbox>
{
  constructor(
    dataSorce: DataSource,
    private readonly outboxProcessor: OutboxProcessor,
  ) {
    dataSorce.subscribers.push(this);
  }

  listenTo() {
    return Outbox;
  }

  async afterInsert(event: InsertEvent<Outbox>): Promise<void> {
    await this.outboxProcessor.dispatchWorkflowEvent(event.entity);
    await event.manager.delete(Outbox, event.entity.id);
  }
}
