import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly db: TypeOrmHealthIndicator,
    private readonly health: HealthCheckService,
  ) {}

  @HealthCheck()
  @Get()
  isHealthy() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
