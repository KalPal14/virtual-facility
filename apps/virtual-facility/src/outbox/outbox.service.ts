import { Injectable } from '@nestjs/common';
import { Outbox } from './entities/outbox.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  getUnprocessetMessages(options: {
    target: string;
    take: number;
  }): Promise<Outbox[]> {
    return this.outboxRepository.find({
      where: { target: options.target },
      order: { createdAt: 'ASC' },
      take: options.take,
    });
  }
}
