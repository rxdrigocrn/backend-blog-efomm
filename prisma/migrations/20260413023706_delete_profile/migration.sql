/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_tagId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tagId" TEXT;

-- DropTable
DROP TABLE "Profile";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
