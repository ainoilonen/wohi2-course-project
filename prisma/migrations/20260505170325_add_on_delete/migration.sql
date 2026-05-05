-- DropForeignKey
ALTER TABLE `guess` DROP FOREIGN KEY `Guess_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_questionId_fkey`;

-- DropIndex
DROP INDEX `Guess_questionId_fkey` ON `guess`;

-- DropIndex
DROP INDEX `likes_questionId_fkey` ON `likes`;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guess` ADD CONSTRAINT `Guess_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
