import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { slug } = req.params;
    const comment = req.body?.comment;

    if (!comment) {
      return res.status(422).json({
        errors: {
          body: ["can't be blank"],
        },
      });
    }

    if (typeof comment.body !== "string") {
      return res.status(422).json({
        errors: {
          body: ["can't be blank"],
        },
      });
    }

    const body = comment.body.trim();

    if (!body) {
      return res.status(422).json({
        errors: {
          body: ["can't be blank"],
        },
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        errors: {
          token: ["is missing"],
        },
      });
    }

    const article = await prisma.article.findUnique({
      where: {
        slug,
      },
    });

    if (!article) {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }

    const newComment = await prisma.comment.create({
      data: {
        body,
        authorId: req.userId,
        articleId: article.id,
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return res.status(201).json({
      comment: newComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
};

export const getComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: {
        slug,
      },
    });

    if (!article) {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId: article.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
};

export async function deleteComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { slug } = req.params;
    const commentId = Number(req.params.commentId);

    const article = await prisma.article.findUnique({
      where: {
        slug,
      },
    });

    if (!article) {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }

    if (!Number.isInteger(commentId)) {
      return res.status(404).json({
        errors: {
          comment: ["not found"],
        },
      });
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        articleId: article.id,
      },
    });

    if (!comment) {
      return res.status(404).json({
        errors: {
          comment: ["not found"],
        },
      });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({
        errors: {
          comment: ["forbidden"],
        },
      });
    }

    await prisma.comment.delete({
      where: {
        id: comment.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
