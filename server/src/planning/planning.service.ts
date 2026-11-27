import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

export interface PlanningTargetsDto {
  weekly: number;
  monthly: number;
}

@Injectable()
export class PlanningService {
  constructor(private readonly prisma: PrismaService) {}

  async getTargets(user: AuthenticatedUser): Promise<PlanningTargetsDto> {
    const record = await this.prisma.userPlanningTargets.findUnique({
      where: { userId: user.uid },
    });
    if (!record) {
      return { weekly: 15, monthly: 60 };
    }
    return {
      weekly: record.weekly,
      monthly: record.monthly,
    };
  }

  async updateTargets(dto: PlanningTargetsDto, user: AuthenticatedUser): Promise<PlanningTargetsDto> {
    const weekly = Math.max(1, Math.round(dto.weekly || 15));
    const monthly = Math.max(1, Math.round(dto.monthly || 60));

    const updated = await this.prisma.userPlanningTargets.upsert({
      where: { userId: user.uid },
      update: { weekly, monthly },
      create: { userId: user.uid, weekly, monthly },
    });

    return {
      weekly: updated.weekly,
      monthly: updated.monthly,
    };
  }
}
