/*
  Warnings:

  - Made the column `reviewRating` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "reviewRating" SET NOT NULL,
ALTER COLUMN "reviewRating" SET DEFAULT 0;
