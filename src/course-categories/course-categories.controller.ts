import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';

@Controller('course-categories')
export class CourseCategoriesController {
  constructor(private readonly courseCategoriesService: CourseCategoriesService) {}

  @Get()
  async findAll() {
    const { data, error } = await this.courseCategoriesService.findAll();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }
}
