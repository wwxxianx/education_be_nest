/*
  Warnings:

  - The primary key for the `user_courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `user_courses` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "user_courses" DROP CONSTRAINT "user_courses_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "user_courses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_vouchers" ADD COLUMN     "appliedCourseId" TEXT;

-- AddForeignKey
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_appliedCourseId_fkey" FOREIGN KEY ("appliedCourseId") REFERENCES "user_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
