const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedQuestions = [
  {
    question: "Q1",
    answer: "A1",
    difficulty: 1,
    userId: 1,
    keywords: ["http", "web"],
  },
  {
    question: "Q2",
    answer: "A2",
    difficulty: 1,
    userId: 1,
    keywords: ["http", "api"],
  },
  {
    question: "Q3",
    answer: "A3",
    difficulty: 2,
    userId: 1,
    keywords: ["javascript", "backend"],
  },
  {
    question: "Q4",
    answer: "A4",
    difficulty: 3,
    userId: 1,
    keywords: ["database", "backend"],
  },
];

const bcrypt = require("bcrypt");

async function main() {
  await prisma.guess.deleteMany();
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.user.deleteMany();

  // Create a default user
  const hashedPassword = await bcrypt.hash("1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "aino@wohii.fi",
      password: hashedPassword,
      name: "aino",
      role: 3,
    },
  });

  console.log("Created user:", user.email);

  for (const question of seedQuestions) {
    await prisma.question.create({
      data: {
        question: question.question,
        answer: question.answer,
        userId: user.id,
        keywords: {
          connectOrCreate: question.keywords.map((kw) => ({
            where: { name: kw },
            create: { name: kw },
          })),
        },
      },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
