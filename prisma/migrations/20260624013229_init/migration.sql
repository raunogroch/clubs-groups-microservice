-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "CoachRole" AS ENUM ('HEAD_COACH', 'ASSISTANT_COACH');

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "maxAthletes" INTEGER,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_coaches" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "role" "CoachRole" NOT NULL DEFAULT 'ASSISTANT_COACH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "group_coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_schedules" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "group_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "groups_assignmentId_idx" ON "groups"("assignmentId");

-- CreateIndex
CREATE INDEX "groups_clubId_idx" ON "groups"("clubId");

-- CreateIndex
CREATE INDEX "groups_status_idx" ON "groups"("status");

-- CreateIndex
CREATE INDEX "groups_available_idx" ON "groups"("available");

-- CreateIndex
CREATE UNIQUE INDEX "groups_clubId_name_key" ON "groups"("clubId", "name");

-- CreateIndex
CREATE INDEX "group_coaches_coachId_idx" ON "group_coaches"("coachId");

-- CreateIndex
CREATE INDEX "group_coaches_available_idx" ON "group_coaches"("available");

-- CreateIndex
CREATE UNIQUE INDEX "group_coaches_groupId_coachId_key" ON "group_coaches"("groupId", "coachId");

-- CreateIndex
CREATE INDEX "enrollments_athleteId_idx" ON "enrollments"("athleteId");

-- CreateIndex
CREATE INDEX "enrollments_groupId_idx" ON "enrollments"("groupId");

-- CreateIndex
CREATE INDEX "enrollments_clubId_idx" ON "enrollments"("clubId");

-- CreateIndex
CREATE INDEX "enrollments_assignmentId_idx" ON "enrollments"("assignmentId");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");

-- CreateIndex
CREATE INDEX "enrollments_available_idx" ON "enrollments"("available");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_groupId_athleteId_key" ON "enrollments"("groupId", "athleteId");

-- CreateIndex
CREATE INDEX "group_schedules_groupId_idx" ON "group_schedules"("groupId");

-- CreateIndex
CREATE INDEX "group_schedules_day_idx" ON "group_schedules"("day");

-- CreateIndex
CREATE INDEX "group_schedules_available_idx" ON "group_schedules"("available");

-- AddForeignKey
ALTER TABLE "group_coaches" ADD CONSTRAINT "group_coaches_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_schedules" ADD CONSTRAINT "group_schedules_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
