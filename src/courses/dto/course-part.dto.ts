import { CoursePart, CourseSection } from '@prisma/client';

export type CreateCoursePartDto = Pick<CoursePart, 'title'> & {
  sectionId: string;
};
