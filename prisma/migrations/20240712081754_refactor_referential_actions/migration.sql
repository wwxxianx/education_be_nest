/*
  Warnings:

  - You are about to drop the column `instructorProfileId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `course_instructor_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `course_instructor_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_faq" DROP CONSTRAINT "course_faq_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_images" DROP CONSTRAINT "course_images_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_parts" DROP CONSTRAINT "course_parts_courseSectionId_fkey";

-- DropForeignKey
ALTER TABLE "course_sections" DROP CONSTRAINT "course_sections_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_updates" DROP CONSTRAINT "course_updates_courseId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_instructorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "vouchers" DROP CONSTRAINT "vouchers_courseId_fkey";

-- AlterTable
ALTER TABLE "course_instructor_profiles" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "instructorProfileId";

-- CreateIndex
CREATE UNIQUE INDEX "course_instructor_profiles_userId_key" ON "course_instructor_profiles"("userId");

-- AddForeignKey
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_courseSectionId_fkey" FOREIGN KEY ("courseSectionId") REFERENCES "course_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_updates" ADD CONSTRAINT "course_updates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_instructor_profiles" ADD CONSTRAINT "course_instructor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_faq" ADD CONSTRAINT "course_faq_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_images" ADD CONSTRAINT "course_images_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
