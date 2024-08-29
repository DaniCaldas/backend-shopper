-- CreateTable
CREATE TABLE `Measures` (
    `measure_uuid` VARCHAR(191) NOT NULL,
    `measure_datetime` DATETIME(3) NOT NULL,
    `measure_type` VARCHAR(191) NOT NULL,
    `has_confirmed` BOOLEAN NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `costumer_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`measure_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Measures` ADD CONSTRAINT `Measures_costumer_id_fkey` FOREIGN KEY (`costumer_id`) REFERENCES `Costumer`(`costumer_code`) ON DELETE RESTRICT ON UPDATE CASCADE;
