import { Test, TestingModule } from '@nestjs/testing';
import { CourseReviewsService } from './course-reviews.service';

describe('CourseReviewsService', () => {
  let service: CourseReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseReviewsService],
    }).compile();

    service = module.get<CourseReviewsService>(CourseReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
