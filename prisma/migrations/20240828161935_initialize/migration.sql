-- CreateTable
CREATE TABLE `Table` (
    `costumer_code` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `measure_datetime` DATETIME(3) NOT NULL,
    `measure_type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`costumer_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
