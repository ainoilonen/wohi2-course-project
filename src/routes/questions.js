const express = require("express");
const router = express.Router();

const questions = require("../data/questions");


// GET /questions
// List all questions
router.get("/", (req, res) => {
  res.json(questions);
});

/*
// GET /questions 
// List all questions if no filter (filter does not exist yet!)
router.get("/", (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.json(questions);
  }

  const filteredQuestions = questions.filter(question =>
    question.keywords.includes(keyword.toLowerCase())
  );

  res.json(filteredQuestions);
});*/

// GET /questions/:questionId
// Show a specific question
router.get("/:questionId", (req, res) => {
  const questionId = Number(req.params.questionId);

  const question = questions.find((q) => q.id === questionId);

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  res.json(question);
});

// POST /questions
// Create a new question
router.post("/", (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      message: "question and answer are required"
    });
  }
  const maxId = Math.max(...questions.map(p => p.id), 0);

  const newQuestion = {
    id: questions.length ? maxId + 1 : 1,
    question, answer
  };
  questions.push(newQuestion);
  res.status(201).json(newQuestion);
});

// PUT /questions/:questionId
// Edit a question
router.put("/:questionId", (req, res) => {
  const edidableQuestionId = Number(req.params.questionId);
  const { question, answer } = req.body;

  const edidableQuestion = questions.find((q) => q.id === edidableQuestionId);

  if (!edidableQuestion) {
    return res.status(404).json({ message: "Question not found!" });
  }

  if (!question || !answer) {
    return res.json({
      message: "Question and answer are required!"
    });
  }

  edidableQuestion.question = question;
  edidableQuestion.answer = answer;

  res.json(edidableQuestion);
});


// DELETE /questions/:questionId
// Delete a question
router.delete("/:questionId", (req, res) => {
  const questionId = Number(req.params.questionId);

  const questionIndex = questions.findIndex((q) => q.id === questionId);

  if (questionIndex === -1) {
    return res.status(404).json({ message: "Question not found!" });
  }

  const deletedQuestion = questions.splice(questionIndex, 1);

  res.json({
    message: "Question deleted successfully!",
    question: deletedQuestion[0]
  });
});


module.exports = router;