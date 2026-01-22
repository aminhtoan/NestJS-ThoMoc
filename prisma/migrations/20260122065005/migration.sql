/*
  Warnings:

  - Made the column `createdById` on table `SKU` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SKU" ALTER COLUMN "createdById" SET NOT NULL;
