import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { EmailModule } from './email/email.module';
import { CourseLevelsModule } from './course-levels/course-levels.module';
import { LanguagesModule } from './languages/languages.module';
import { CoursesModule } from './courses/courses.module';
import { CourseCategoriesModule } from './course-categories/course-categories.module';
import { CourseUpdatesModule } from './course-updates/course-updates.module';
import { CourseReviewsModule } from './course-reviews/course-reviews.module';

@Global()
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [AsyncLocalStorage],
  imports: [EmailModule, CourseLevelsModule, LanguagesModule, CoursesModule, CourseCategoriesModule, CourseUpdatesModule, CourseReviewsModule],
})
export class AlsModule {}
