import { Injectable } from '@nestjs/common';
import { CreateCourseUpdateDto } from './dto/create-course-update.dto';
import { UpdateCourseUpdateDto } from './dto/update-course-update.dto';

@Injectable()
export class CourseUpdatesService {
  create(createCourseUpdateDto: CreateCourseUpdateDto) {
    return 'This action adds a new courseUpdate';
  }

  findAll() {
    return `This action returns all courseUpdates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseUpdate`;
  }

  update(id: number, updateCourseUpdateDto: UpdateCourseUpdateDto) {
    return `This action updates a #${id} courseUpdate`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseUpdate`;
  }
}
