import { Module } from '@nestjs/common';
import { CourseUpdatesService } from './course-updates.service';
import { CourseUpdatesController } from './course-updates.controller';

@Module({
  controllers: [CourseUpdatesController],
  providers: [CourseUpdatesService],
})
export class CourseUpdatesModule {}
