import { Response } from "express";

import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { serializeArticleDetail } from "../serializers/article.serializer";

export async function favoriteArticleController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.userId!;

    const article = await prisma.article.findUnique({
      where: {
        slug: req.params.slug,
      },
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: true,
      },
    });

    if (!article) {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }

    await prisma.favorite.upsert({
      where: {
        userId_articleId: {
          userId,
          articleId: article.id,
        },
      },
      create: {
        userId,
        articleId: article.id,
      },
      update: {},
    });

    const updatedArticle = await prisma.article.findUniqueOrThrow({
      where: {
        id: article.id,
      },
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: true,
      },
    });

    return res.status(200).json({
      article: serializeArticleDetail(updatedArticle, userId),
    });
  } catch (error) {
    console.error("Favorite article error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
export async function unfavoriteArticleController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.userId!;

    const article = await prisma.article.findUnique({
      where: {
        slug: req.params.slug,
      },
    });

    if (!article) {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId,
        articleId: article.id,
      },
    });

    const updatedArticle = await prisma.article.findUniqueOrThrow({
      where: {
        id: article.id,
      },
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: true,
      },
    });

    return res.status(200).json({
      article: serializeArticleDetail(updatedArticle, userId),
    });
  } catch (error) {
    console.error("Unfavorite article error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
