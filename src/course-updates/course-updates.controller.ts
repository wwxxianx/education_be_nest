import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseUpdatesService } from './course-updates.service';
import { CreateCourseUpdateDto } from './dto/create-course-update.dto';
import { UpdateCourseUpdateDto } from './dto/update-course-update.dto';

@Controller('course-updates')
export class CourseUpdatesController {
  constructor(private readonly courseUpdatesService: CourseUpdatesService) {}

  @Post()
  create(@Body() createCourseUpdateDto: CreateCourseUpdateDto) {
    return this.courseUpdatesService.create(createCourseUpdateDto);
  }

  @Get()
  findAll() {
    return this.courseUpdatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseUpdatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseUpdateDto: UpdateCourseUpdateDto) {
    return this.courseUpdatesService.update(+id, updateCourseUpdateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseUpdatesService.remove(+id);
  }
}
