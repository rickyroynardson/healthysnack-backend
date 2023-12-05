/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceNumber` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `invoiceNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Sale_invoiceNumber_key` ON `Sale`(`invoiceNumber`);
