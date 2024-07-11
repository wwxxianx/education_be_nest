import { Test, TestingModule } from '@nestjs/testing';
import { CourseUpdatesService } from './course-updates.service';

describe('CourseUpdatesService', () => {
  let service: CourseUpdatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseUpdatesService],
    }).compile();

    service = module.get<CourseUpdatesService>(CourseUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
