import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

export interface CreateUserTaskDto {
  id?: string;
  title: string;
  description?: string;
  startDate?: string;
  dueDate: string;
  dueTime?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  state?: 'active' | 'completed' | 'archived';
  completedAt?: string;
  checkpoints?: Array<{ id: string; timestamp: string; note: string }>;
}

export interface UpdateUserTaskDto {
  title?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  state?: 'active' | 'completed' | 'archived';
  completedAt?: string;
  checkpoints?: Array<{ id: string; timestamp: string; note: string }>;
}

function parseCheckpoints(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTask(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    startDate: task.startDate ?? undefined,
    dueDate: task.dueDate,
    dueTime: task.dueTime ?? undefined,
    priority: task.priority,
    category: task.category,
    state: task.state,
    completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : undefined,
    checkpoints: parseCheckpoints(task.checkpoints),
    createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
  };
}

@Injectable()
export class UserTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTasks(user: AuthenticatedUser) {
    const tasks = await this.prisma.userTask.findMany({
      where: { userId: user.uid },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(formatTask);
  }

  async createUserTask(dto: CreateUserTaskDto, user: AuthenticatedUser) {
    const created = await this.prisma.userTask.create({
      data: {
        id: dto.id || undefined,
        userId: user.uid,
        title: dto.title,
        description: dto.description || null,
        startDate: dto.startDate || null,
        dueDate: dto.dueDate,
        dueTime: dto.dueTime || null,
        priority: dto.priority || 'medium',
        category: dto.category || 'personal',
        state: dto.state || 'active',
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        checkpoints: dto.checkpoints ? JSON.stringify(dto.checkpoints) : null,
      },
    });
    return formatTask(created);
  }

  async updateUserTask(id: string, dto: UpdateUserTaskDto, user: AuthenticatedUser) {
    const existing = await this.prisma.userTask.findFirst({
      where: { id, userId: user.uid },
    });
    if (!existing) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description || null;
    if (dto.startDate !== undefined) data.startDate = dto.startDate || null;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate;
    if (dto.dueTime !== undefined) data.dueTime = dto.dueTime || null;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.state !== undefined) data.state = dto.state;
    if (dto.completedAt !== undefined) {
      data.completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
    }
    if (dto.checkpoints !== undefined) {
      data.checkpoints = dto.checkpoints ? JSON.stringify(dto.checkpoints) : null;
    }

    const updated = await this.prisma.userTask.update({
      where: { id },
      data,
    });
    return formatTask(updated);
  }

  async deleteUserTask(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.userTask.findFirst({
      where: { id, userId: user.uid },
    });
    if (!existing) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    await this.prisma.userTask.delete({ where: { id } });
    return { success: true };
  }
}
