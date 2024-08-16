import { CourseInstructorProfile } from '@prisma/client';

export type CreateInstructorProfileDto = Pick<
  CourseInstructorProfile,
  'fullName' | 'title'
>;
