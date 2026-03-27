/*
  Warnings:

  - You are about to drop the column `courseCategoryId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseLevelId` on the `courses` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('Video', 'PDF', 'Document', 'Assignment', 'Link');

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_courseCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_courseLevelId_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "courseCategoryId",
DROP COLUMN "courseLevelId",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "levelId" TEXT;

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lessons_moduleId_order_key" ON "lessons"("moduleId", "order");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "course_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "course_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
