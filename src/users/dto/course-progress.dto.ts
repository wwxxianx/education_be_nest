export type CourseProgressDto = {
  courseId: string;
  partId: string;
};

export type CourseProgressPayload = CourseProgressDto & { userId: string };