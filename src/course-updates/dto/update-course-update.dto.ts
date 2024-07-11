import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseUpdateDto } from './create-course-update.dto';

export class UpdateCourseUpdateDto extends PartialType(CreateCourseUpdateDto) {}
