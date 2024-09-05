import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InboxService } from '../inbox/inbox.service';
import { EntityManager } from 'typeorm';
import { Workflow } from './entities/workflow.entity';
import { Inbox } from '../inbox/entities/inbox.entity';

@Injectable()
export class WorkflowsInboxProcessor {
  logger = new Logger();
  constructor(private readonly inboxService: InboxService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processInboxMessages() {
    this.logger.debug(`Processing inbox messages`);

    await this.inboxService.processInboxMessages(
      async (messages, manager) => {
        return Promise.all(
          messages.map((message) => {
            switch (message.pattern) {
              case 'workflows.create':
                return this.createWorkflow(message, manager);
            }
          }),
        );
      },
      { take: 100 },
    );
  }

  async createWorkflow(message: Inbox, manager: EntityManager) {
    const workflowsRepository = manager.getRepository(Workflow);

    const workflow = workflowsRepository.create(message.payload);
    const newWorkflowEntity = await workflowsRepository.save(workflow);
    this.logger.debug(
      `Created workflow with id ${newWorkflowEntity.id} for building ${newWorkflowEntity.buildingId}`,
    );

    manager.update(Inbox, { id: message.id }, { status: 'processed' });
  }
}
