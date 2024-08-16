-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "recommendedCourseSearchTerm" TEXT;

-- CreateTable
CREATE TABLE "RecommendedCourse" (
    "searchTerm" TEXT NOT NULL,

    CONSTRAINT "RecommendedCourse_pkey" PRIMARY KEY ("searchTerm")
);

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_recommendedCourseSearchTerm_fkey" FOREIGN KEY ("recommendedCourseSearchTerm") REFERENCES "RecommendedCourse"("searchTerm") ON DELETE SET NULL ON UPDATE CASCADE;
