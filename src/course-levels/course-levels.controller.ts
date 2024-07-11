import {
  Controller,
  Get,
  InternalServerErrorException
} from '@nestjs/common';
import { CourseLevelsService } from './course-levels.service';

@Controller('course-levels')
export class CourseLevelsController {
  constructor(private readonly courseLevelsService: CourseLevelsService) {}

  @Get()
  async findAll() {
    const { data, error } = await this.courseLevelsService.findAll();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }
}
