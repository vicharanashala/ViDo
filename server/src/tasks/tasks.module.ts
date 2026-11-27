import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { UserTasksService } from './user-tasks.service';
import { UserTasksController } from './user-tasks.controller';

@Module({
  controllers: [TasksController, UserTasksController],
  providers: [TasksService, UserTasksService],
  exports: [TasksService, UserTasksService],
})
export class TasksModule {}
