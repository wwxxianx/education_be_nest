import { UserReview } from "@prisma/client";

export type CreateCourseReviewDto = Pick<UserReview, "courseId" | "reviewRating" | "reviewContent">;
