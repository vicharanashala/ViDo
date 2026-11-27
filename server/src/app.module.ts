import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TeamsModule } from './teams/teams.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MilestonesModule } from './milestones/milestones.module';
import { TasksModule } from './tasks/tasks.module';
import { CalendarModule } from './calendar/calendar.module';
import { CategoriesModule } from './categories/categories.module';
import { PlanningModule } from './planning/planning.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EventsModule,
    TeamsModule,
    InvitationsModule,
    MilestonesModule,
    TasksModule,
    CalendarModule,
    CategoriesModule,
    PlanningModule,
  ],
})
export class AppModule {}
