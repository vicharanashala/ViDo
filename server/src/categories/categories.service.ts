import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

export interface CreateCategoryDto {
  id?: string;
  name: string;
  color?: string;
}

function formatCategory(cat: any) {
  return {
    id: cat.id,
    name: cat.name,
    color: cat.color ?? undefined,
    isCustom: true,
  };
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(user: AuthenticatedUser) {
    const categories = await this.prisma.userCustomCategory.findMany({
      where: { userId: user.uid },
      orderBy: { createdAt: 'asc' },
    });
    return categories.map(formatCategory);
  }

  async createCategory(dto: CreateCategoryDto, user: AuthenticatedUser) {
    const created = await this.prisma.userCustomCategory.create({
      data: {
        id: dto.id || undefined,
        userId: user.uid,
        name: dto.name,
        color: dto.color || null,
      },
    });
    return formatCategory(created);
  }

  async deleteCategory(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.userCustomCategory.findFirst({
      where: { id, userId: user.uid },
    });
    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    await this.prisma.userCustomCategory.delete({ where: { id } });
    return { success: true };
  }
}
