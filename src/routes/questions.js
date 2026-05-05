const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "public", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

function parseKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords === "string") {
    return keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

router.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err?.message === "Only image files are allowed"
  ) {
    return res.status(400).json({ msg: err.message });
  }
  next(err);
});

// Apply authentication to ALL routes in this router
router.use(authenticate);

function formatQuestion(question) {
  return {
    ...question,
    //date: question.date.toISOString().split("T")[0],
    keywords: question.keywords.map((k) => k.name) || [],
    userName: question.user?.name || null,
    solved: question.guesses?.length > 0,
    user: undefined,
    guesses: undefined,
  };
}

// GET /questions
// List all questions
/*router.get("/", (req, res) => {
  res.json(questions);
});*/

// GET /questions
// List all questions if no filter (filter does not exist yet!)
router.get("/", async (req, res) => {
  const { keyword } = req.query;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 3));
  const skip = (page - 1) * limit;

  const where = keyword ? { keywords: { some: { name: keyword } } } : {};

  const [filteredQuestions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        keywords: true,
        user: true,
        guesses: {
          where: {
            userId: req.user.userId,
            correct: true,
          },
          take: 1,
        },
      },
      orderBy: { id: "asc" },
      skip,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  if (!filteredQuestions) {
    return res.status(404).json({
      message: "Not found",
    });
  }

  res.json({
    data: filteredQuestions.map(formatQuestion),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /questions/:questionId
// Show a specific question
router.get("/:questionId", async (req, res) => {
  const questionId = Number(req.params.questionId);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      keywords: true,
      user: true,
      guesses: {
        where: {
          userId: req.user.userId,
          correct: true,
        },
        take: 1,
      },
    },
  });

  if (!question) {
    return res.status(404).json({
      message: "Question not found",
    });
  }

  res.json(formatQuestion(question));
});

// POST /questions/:questionId/play
router.post("/:questionId/play", async (req, res) => {
  const questionId = Number(req.params.questionId);
  const { answer } = req.body;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const isCorrect =
    question.answer.trim().toLowerCase() === answer.trim().toLowerCase();

  await prisma.guess.create({
    data: {
      correct: isCorrect,
      submittedAnswer: answer,
      correctAnswer: question.answer,
      questionId: questionId,
      userId: req.user.userId,
    },
  });

  res.json({
    correct: isCorrect,
    correctAnswer: question.answer,
  });
});

// POST /questions
// Create a new question
router.post("/", upload.single("image"), async (req, res) => {
  const { question, answer, keywords } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      message: "question and answer are required",
    });
  }
  const keywordsArray = parseKeywords(keywords);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newQuestion = await prisma.question.create({
    data: {
      question,
      answer,
      imageUrl,
      userId: req.user.userId,
      keywords: {
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw },
          create: { name: kw },
        })),
      },
    },
    include: { keywords: true, user: true },
  });

  res.status(201).json(formatQuestion(newQuestion));
});

// PUT /questions/:questionId
// Edit a question
router.put(
  "/:questionId",
  upload.single("image"),
  isOwner,
  async (req, res) => {
    const edidableQuestionId = Number(req.params.questionId);
    const { question, answer, keywords } = req.body;

    const edidableQuestion = await prisma.question.findUnique({
      where: { id: edidableQuestionId },
    });
    if (!edidableQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!question || !answer) {
      return res.status(400).json({ msg: "question and answer are mandatory" });
    }

    const keywordsArray = parseKeywords(keywords);

    const data = {
      question,
      answer,
      keywords: {
        set: [],
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw },
          create: { name: kw },
        })),
      },
    };

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: edidableQuestionId },
      data,
      include: {
        keywords: true,
        user: true,
      },
    });

    res.json(formatQuestion(updatedQuestion));
  },
);

// DELETE /questions/:questionId
// Delete a question
router.delete("/:questionId", isOwner, async (req, res) => {
  const questionId = Number(req.params.questionId);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { keywords: true, user: true },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  await prisma.question.delete({ where: { id: questionId } });

  res.json({
    message: "Question deleted successfully!",
    question: formatQuestion(question),
  });
});

module.exports = router;
