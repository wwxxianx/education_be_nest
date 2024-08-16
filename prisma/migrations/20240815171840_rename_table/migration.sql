/*
  Warnings:

  - You are about to drop the `CourseProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFavouriteCourse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_partId_fkey";

-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_userCourseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavouriteCourse" DROP CONSTRAINT "UserFavouriteCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserFavouriteCourse" DROP CONSTRAINT "UserFavouriteCourse_userId_fkey";

-- DropTable
DROP TABLE "CourseProgress";

-- DropTable
DROP TABLE "UserFavouriteCourse";

-- CreateTable
CREATE TABLE "user_favourite_courses" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favourite_courses_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "course_progresses" (
    "userCourseId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "course_progresses_pkey" PRIMARY KEY ("userCourseId","partId")
);

-- AddForeignKey
ALTER TABLE "user_favourite_courses" ADD CONSTRAINT "user_favourite_courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favourite_courses" ADD CONSTRAINT "user_favourite_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progresses" ADD CONSTRAINT "course_progresses_userCourseId_fkey" FOREIGN KEY ("userCourseId") REFERENCES "user_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progresses" ADD CONSTRAINT "course_progresses_partId_fkey" FOREIGN KEY ("partId") REFERENCES "course_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progresses" ADD CONSTRAINT "course_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
