import { Module } from '@nestjs/common';
import { CourseLevelsService } from './course-levels.service';
import { CourseLevelsController } from './course-levels.controller';

@Module({
  controllers: [CourseLevelsController],
  providers: [CourseLevelsService],
})
export class CourseLevelsModule {}
