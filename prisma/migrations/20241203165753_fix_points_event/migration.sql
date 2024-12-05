/*
  Warnings:

  - You are about to drop the column `point` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "point",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 10;
