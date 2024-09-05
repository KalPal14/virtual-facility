import { CreateWorkflowDto } from '@app/workflows';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { WORKFLOWS_SERVICE } from '../constants';
import { Outbox } from '../outbox/entities/outbox.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingsRepository: Repository<Building>,
    // ClientProxy это абстракция, прячушая
    // выбраную нами стратегию транспортировки
    // => нам не нужно менять код при сменя технологии траспорттровки
    @Inject(WORKFLOWS_SERVICE)
    private readonly workflowsServise: ClientProxy,
    private readonly dataSourcea: DataSource,
  ) {}

  async findAll(): Promise<Building[]> {
    return this.buildingsRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingsRepository.findOne({ where: { id } });
    if (!building) {
      throw new NotFoundException(`Building #${id} does not exist`);
    }
    return building;
  }

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const queryRunner = this.dataSourcea.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const buildingsRepository = queryRunner.manager.getRepository(Building);
    const outboxRepository = queryRunner.manager.getRepository(Outbox);

    try {
      const building = buildingsRepository.create(createBuildingDto);
      const newBuildingEntity = await buildingsRepository.save(building);

      await outboxRepository.save({
        type: 'workflows.create',
        payload: {
          name: 'My Workflow',
          buildingId: building.id,
        },
        target: WORKFLOWS_SERVICE.description,
      });

      await queryRunner.commitTransaction();

      return newBuildingEntity;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingsRepository.preload({
      id: +id,
      ...updateBuildingDto,
    });

    if (!building) {
      throw new NotFoundException(`Building #${id} does not exist`);
    }
    return this.buildingsRepository.save(building);
  }

  async remove(id: number): Promise<Building> {
    const building = await this.findOne(id);
    return this.buildingsRepository.remove(building);
  }

  async createWorkflow(buildingId: number) {
    // нужно исп. lastValueFrom т.к.
    // workflowsServise.send возвращает Observable stram
    const newWorkflow = await lastValueFrom(
      this.workflowsServise.send('workflows.create', {
        name: 'Workflow 1',
        buildingId: buildingId,
      } as CreateWorkflowDto),
    );
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
