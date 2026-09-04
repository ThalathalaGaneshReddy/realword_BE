import { Response } from "express";

import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { serializeArticleList } from "../serializers/article.serializer";

export async function feedArticlesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.userId!;
    const limitValue =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 20;

    const offsetValue =
      typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0 ? limitValue : 20;

    const offset =
      Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;

    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = follows.map((follow) => follow.followingId);

    const articlesCount = await prisma.article.count({
      where: {
        authorId: {
          in: followingIds,
        },
      },
    });

    const articles = await prisma.article.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
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

      orderBy: {
        createdAt: "desc",
      },

      skip: offset,
      take: limit,
    });

    const result = articles.map((article) =>
      serializeArticleList(article, userId, followingIds),
    );

    return res.status(200).json({
      articles: result,
      articlesCount,
    });
  } catch (error) {
    console.error("Feed articles error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
