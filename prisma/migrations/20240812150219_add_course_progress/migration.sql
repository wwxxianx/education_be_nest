/*
  Warnings:

  - The primary key for the `CourseProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CourseProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CourseProgress" DROP CONSTRAINT "CourseProgress_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" TEXT,
ADD CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("userCourseId", "partId");

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
