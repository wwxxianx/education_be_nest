import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseLevelDto } from './create-course-level.dto';

export class UpdateCourseLevelDto extends PartialType(CreateCourseLevelDto) {}
