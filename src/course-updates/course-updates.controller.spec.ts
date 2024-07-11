import { Test, TestingModule } from '@nestjs/testing';
import { CourseUpdatesController } from './course-updates.controller';
import { CourseUpdatesService } from './course-updates.service';

describe('CourseUpdatesController', () => {
  let controller: CourseUpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseUpdatesController],
      providers: [CourseUpdatesService],
    }).compile();

    controller = module.get<CourseUpdatesController>(CourseUpdatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
