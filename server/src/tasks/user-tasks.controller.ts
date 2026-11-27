import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserTasksService, CreateUserTaskDto, UpdateUserTaskDto } from './user-tasks.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api/user/tasks')
@UseGuards(FirebaseAuthGuard)
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) {}

  @Get()
  async getUserTasks(@CurrentUser() user: AuthenticatedUser) {
    return this.userTasksService.getUserTasks(user);
  }

  @Post()
  async createUserTask(
    @Body() dto: CreateUserTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.userTasksService.createUserTask(dto, user);
  }

  @Patch(':id')
  async updateUserTask(
    @Param('id') id: string,
    @Body() dto: UpdateUserTaskDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.userTasksService.updateUserTask(id, dto, user);
  }

  @Delete(':id')
  async deleteUserTask(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.userTasksService.deleteUserTask(id, user);
  }
}
