-- CreateTable
CREATE TABLE `Guess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correct` BOOLEAN NOT NULL,
    `submittedAnswer` VARCHAR(255) NOT NULL,
    `correctAnswer` VARCHAR(255) NOT NULL,
    `questionId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guess` ADD CONSTRAINT `Guess_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guess` ADD CONSTRAINT `Guess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
