/*
  Warnings:

  - You are about to drop the `Header` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Logo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Header" DROP CONSTRAINT "Header_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Logo" DROP CONSTRAINT "Logo_eventId_fkey";

-- DropTable
DROP TABLE "Header";

-- DropTable
DROP TABLE "Logo";
