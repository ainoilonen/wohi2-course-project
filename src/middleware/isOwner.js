const prisma = require("../lib/prisma");
const { NotFoundError, ForbiddenError } = require("../lib/errors");

async function isOwner(req, res, next) {
  const id = Number(req.params.questionId);
  const question = await prisma.question.findUnique({
    where: { id },
    include: { keywords: true },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.userId !== req.user.userId) {
    throw new ForbiddenError("You can only modify your own posts");
  }

  // Attach the record to the request so the route handler can reuse it
  req.question = question;
  next();
}

module.exports = isOwner;
