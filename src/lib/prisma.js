const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//console.log("DATABASE_URL =", process.env.DATABASE_URL);

module.exports = prisma;
