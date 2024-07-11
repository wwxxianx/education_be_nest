import { Test, TestingModule } from '@nestjs/testing';
import { CourseReviewsController } from './course-reviews.controller';
import { CourseReviewsService } from './course-reviews.service';

describe('CourseReviewsController', () => {
  let controller: CourseReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseReviewsController],
      providers: [CourseReviewsService],
    }).compile();

    controller = module.get<CourseReviewsController>(CourseReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
