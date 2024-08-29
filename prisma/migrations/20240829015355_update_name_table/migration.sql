/*
  Warnings:

  - You are about to drop the `table` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `table`;

-- CreateTable
CREATE TABLE `Costumer` (
    `costumer_code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`costumer_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
