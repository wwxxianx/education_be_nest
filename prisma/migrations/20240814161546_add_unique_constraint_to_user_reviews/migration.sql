/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `user_reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_reviews_userId_courseId_key" ON "user_reviews"("userId", "courseId");
