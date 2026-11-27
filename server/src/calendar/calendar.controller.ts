import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CalendarService, CreateCalendarEventDto } from './calendar.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api/user/calendar-events')
@UseGuards(FirebaseAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getEvents(@CurrentUser() user: AuthenticatedUser) {
    return this.calendarService.getEvents(user);
  }

  @Post()
  async createEvent(
    @Body() dto: CreateCalendarEventDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.calendarService.createEvent(dto, user);
  }

  @Delete(':id')
  async deleteEvent(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.calendarService.deleteEvent(id, user);
  }
}
