import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { UpdateCourseReviewDto } from './dto/update-course-review.dto';

@Controller('course-reviews')
export class CourseReviewsController {
  constructor(private readonly courseReviewsService: CourseReviewsService) {}

  @Post()
  create(@Body() createCourseReviewDto: CreateCourseReviewDto) {
    return this.courseReviewsService.create(createCourseReviewDto);
  }

  @Get()
  findAll() {
    return this.courseReviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseReviewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseReviewDto: UpdateCourseReviewDto) {
    return this.courseReviewsService.update(+id, updateCourseReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseReviewsService.remove(+id);
  }
}
