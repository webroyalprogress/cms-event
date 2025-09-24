/*
  Warnings:

  - Made the column `slug` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "slug" SET NOT NULL;
