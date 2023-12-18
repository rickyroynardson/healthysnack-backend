/*
  Warnings:

  - Added the required column `memo` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderDate` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Purchase` ADD COLUMN `memo` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderDate` DATETIME(3) NOT NULL,
    ADD COLUMN `vendor` VARCHAR(191) NOT NULL;
