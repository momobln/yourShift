/*
  Warnings:

  - Added the required column `type` to the `Shift` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "type" TEXT NOT NULL;
