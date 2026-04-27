const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedQuestions = [
  {
    question: "Q1",
    answer: "A1",
    userId: 1,
    keywords: ["http", "web"],
  },
  {
    question: "Q2",
    answer: "A2",
    userId: 1,
    keywords: ["http", "api"],
  },
  {
    question: "Q3",
    answer: "A3",
    userId: 1,
    keywords: ["javascript", "backend"],
  },
  {
    question: "Q4",
    answer: "A4",
    userId: 1,
    keywords: ["database", "backend"],
  },
];


const bcrypt = require("bcrypt");

async function main() {
  // Create a default user
  const hashedPassword = await bcrypt.hash("1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "aino@wohii.fi",
      password: hashedPassword,
      name: "aino",
    },
  });

  console.log("Created user:", user.email);
  
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();
  //await prisma.user.deleteMany();

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