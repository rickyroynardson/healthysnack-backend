-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `productCategoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_productCategoryId_fkey` FOREIGN KEY (`productCategoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
