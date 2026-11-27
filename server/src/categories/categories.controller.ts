import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService, CreateCategoryDto } from './categories.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/firebase-admin.service';

@Controller('api/user/categories')
@UseGuards(FirebaseAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.getCategories(user);
  }

  @Post()
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.categoriesService.createCategory(dto, user);
  }

  @Delete(':id')
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.categoriesService.deleteCategory(id, user);
  }
}
