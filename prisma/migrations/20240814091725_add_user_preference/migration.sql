-- AlterTable
ALTER TABLE "course_categories" ADD COLUMN     "userPreferenceId" TEXT;

-- AlterTable
ALTER TABLE "course_subcategories" ADD COLUMN     "userPreferenceId" TEXT;

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_userPreferenceId_fkey" FOREIGN KEY ("userPreferenceId") REFERENCES "user_preferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subcategories" ADD CONSTRAINT "course_subcategories_userPreferenceId_fkey" FOREIGN KEY ("userPreferenceId") REFERENCES "user_preferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
