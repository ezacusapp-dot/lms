-- CreateTable
CREATE TABLE "course_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_duration_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_duration_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "award_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "award_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#49205E',
    "icon" TEXT,
    "categoryLogo" TEXT,
    "categoryBackground" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "levelId" TEXT,
    "durationTypeId" TEXT,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" TEXT NOT NULL,
    "certificateName" TEXT NOT NULL,
    "passThreshold" INTEGER NOT NULL DEFAULT 75,
    "includeRanking" BOOLEAN NOT NULL DEFAULT true,
    "includeScore" BOOLEAN NOT NULL DEFAULT true,
    "validityPeriod" TEXT NOT NULL DEFAULT 'Lifetime',
    "gradeA" INTEGER NOT NULL DEFAULT 90,
    "gradeB" INTEGER NOT NULL DEFAULT 75,
    "gradeC" INTEGER NOT NULL DEFAULT 60,
    "borderStyle" TEXT NOT NULL DEFAULT 'classic',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "primaryColor" TEXT NOT NULL DEFAULT '#49205E',
    "accentColor" TEXT NOT NULL DEFAULT '#BC579E',
    "logoUrl" TEXT,
    "backgroundPattern" TEXT,
    "sealEnabled" BOOLEAN NOT NULL DEFAULT true,
    "qrPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "awardCategoryId" TEXT,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validity_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validity_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "description" TEXT,
    "createdBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseLevelId" TEXT,
    "courseCategoryId" TEXT,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_levels_name_key" ON "course_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "course_duration_types_name_key" ON "course_duration_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "award_categories_name_key" ON "award_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_code_key" ON "course_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_templates_categoryId_key" ON "certificate_templates"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "validity_periods_name_key" ON "validity_periods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "modules_courseId_order_key" ON "modules"("courseId", "order");

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "course_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_durationTypeId_fkey" FOREIGN KEY ("durationTypeId") REFERENCES "course_duration_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "course_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_awardCategoryId_fkey" FOREIGN KEY ("awardCategoryId") REFERENCES "award_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseLevelId_fkey" FOREIGN KEY ("courseLevelId") REFERENCES "course_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseCategoryId_fkey" FOREIGN KEY ("courseCategoryId") REFERENCES "course_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
