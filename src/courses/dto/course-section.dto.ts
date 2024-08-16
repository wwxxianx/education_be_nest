import { CourseSection } from '@prisma/client';

export type UpdateCourseSectionDto = Pick<CourseSection, 'title'>;
export type CreateCourseSectionDto = Pick<
  CourseSection,
  'courseId' | 'title'
> & {
  coursePartsTitle: string[];
};
