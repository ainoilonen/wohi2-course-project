/*
  Warnings:

  - You are about to drop the `guess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `guess` DROP FOREIGN KEY `Guess_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `guess` DROP FOREIGN KEY `Guess_userId_fkey`;

-- DropTable
DROP TABLE `guess`;

-- CreateTable
CREATE TABLE `guesses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correct` BOOLEAN NOT NULL,
    `submittedAnswer` VARCHAR(255) NOT NULL,
    `correctAnswer` VARCHAR(255) NOT NULL,
    `questionId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guesses` ADD CONSTRAINT `guesses_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guesses` ADD CONSTRAINT `guesses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
