import { Module } from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CourseReviewsController } from './course-reviews.controller';

@Module({
  controllers: [CourseReviewsController],
  providers: [CourseReviewsService],
})
export class CourseReviewsModule {}
