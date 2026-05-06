/*
  Warnings:

  - You are about to add the column `isActive` to the `User` table. Existing rows will be marked as active.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;