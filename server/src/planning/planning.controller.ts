import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PlanningService, PlanningTargetsDto } from './planning.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api/user/planning-targets')
@UseGuards(FirebaseAuthGuard)
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get()
  async getTargets(@CurrentUser() user: AuthenticatedUser) {
    return this.planningService.getTargets(user);
  }

  @Put()
  async updateTargets(
    @Body() dto: PlanningTargetsDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.planningService.updateTargets(dto, user);
  }
}
