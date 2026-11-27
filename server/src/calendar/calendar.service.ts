import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

export interface CreateCalendarEventDto {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  endTime?: string;
  linkedTaskId?: string;
  source?: 'calendar' | 'task';
}

function formatEvent(e: any) {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? undefined,
    date: e.date,
    time: e.time ?? undefined,
    endTime: e.endTime ?? undefined,
    linkedTaskId: e.linkedTaskId ?? undefined,
    source: (e.source as 'calendar' | 'task') || 'calendar',
  };
}

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(user: AuthenticatedUser) {
    const events = await this.prisma.userCalendarEvent.findMany({
      where: { userId: user.uid },
      orderBy: { date: 'asc' },
    });
    return events.map(formatEvent);
  }

  async createEvent(dto: CreateCalendarEventDto, user: AuthenticatedUser) {
    const created = await this.prisma.userCalendarEvent.create({
      data: {
        id: dto.id || undefined,
        userId: user.uid,
        title: dto.title,
        description: dto.description || null,
        date: dto.date,
        time: dto.time || null,
        endTime: dto.endTime || null,
        linkedTaskId: dto.linkedTaskId || null,
        source: dto.source || 'calendar',
      },
    });
    return formatEvent(created);
  }

  async deleteEvent(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.userCalendarEvent.findFirst({
      where: { id, userId: user.uid },
    });
    if (!existing) {
      throw new NotFoundException(`Calendar event ${id} not found`);
    }
    await this.prisma.userCalendarEvent.delete({ where: { id } });
    return { success: true };
  }
}
