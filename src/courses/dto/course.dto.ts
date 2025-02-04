import { Course, CoursePart } from '@prisma/client';

export type CreateCourseDto = Pick<
  Course,
  | 'categoryId'
  | 'description'
  | 'levelId'
  | 'requirements'
  | 'title'
  | 'topics'
  | 'languageId'
> & {
  subcategoryIds: string[];
  sectionOneTitle: string;
  coursePartsTitle: string[];
  price: number;
};

export type UpdateCourseDto = Partial<
  Pick<
    Course,
    | 'categoryId'
    | 'description'
    | 'levelId'
    | 'requirements'
    | 'title'
    | 'topics'
    | 'languageId'
    | 'status'
    | 'price'
  > & {
    subcategoryIds: string[];
  }
>;
