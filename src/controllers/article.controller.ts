import { Response } from "express";

import {
  createArticle,
  getArticleBySlug,
  getArticles,
  updateArticle,
  deleteArticle,
} from "../services/article.service";

import {
  serializeArticleDetail,
  serializeArticleList,
} from "../serializers/article.serializer";

import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function createArticleController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const article = req.body?.article;

    if (!article) {
      return res.status(422).json({
        errors: {
          body: ["article is required"],
        },
      });
    }

    if (typeof article.title !== "string" || !article.title.trim()) {
      return res.status(422).json({
        errors: {
          title: ["can't be blank"],
        },
      });
    }

    if (
      typeof article.description !== "string" ||
      !article.description.trim()
    ) {
      return res.status(422).json({
        errors: {
          description: ["can't be blank"],
        },
      });
    }

    if (typeof article.body !== "string" || !article.body.trim()) {
      return res.status(422).json({
        errors: {
          body: ["can't be blank"],
        },
      });
    }

    if (article.tagList !== undefined && !Array.isArray(article.tagList)) {
      return res.status(422).json({
        errors: {
          tagList: ["must be an array"],
        },
      });
    }

    const createdArticle = await createArticle(req.userId!, {
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
    });

    return res.status(201).json({
      article: serializeArticleDetail(createdArticle, req.userId),
    });
  } catch (error) {
    console.error("Create article error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function listArticlesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const author =
      typeof req.query.author === "string" ? req.query.author : undefined;

    const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;

    const favorited =
      typeof req.query.favorited === "string" ? req.query.favorited : undefined;

    const limitValue =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 20;

    const offsetValue =
      typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

    const limit =
      Number.isInteger(limitValue) && limitValue > 0 ? limitValue : 20;

    const offset =
      Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;

    const { articles, articlesCount } = await getArticles({
      author,
      tag,
      favorited,
      limit,
      offset,
    });

    const result = articles.map((article) =>
      serializeArticleList(article, req.userId),
    );

    return res.status(200).json({
      articles: result,
      articlesCount,
    });
  } catch (error) {
    console.error("List articles error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function getArticleController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const article = await getArticleBySlug(req.params.slug);

    if (!article) {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }

    return res.status(200).json({
      article: serializeArticleDetail(article, req.userId),
    });
  } catch (error) {
    console.error("Get article error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function updateArticleController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const article = req.body?.article;

    if (!article) {
      return res.status(422).json({
        errors: {
          body: ["article is required"],
        },
      });
    }
    if (article.tagList === null) {
      return res.status(422).json({
        errors: {
          tagList: ["must be an array"],
        },
      });
    }

    if (article.tagList !== undefined && !Array.isArray(article.tagList)) {
      return res.status(422).json({
        errors: {
          tagList: ["must be an array"],
        },
      });
    }

    const result = await updateArticle(req.params.slug, req.userId!, {
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
    });

    if (result.type === "NOT_FOUND") {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }
    if (result.type === "FORBIDDEN") {
      return res.status(403).json({
        errors: {
          article: ["forbidden"],
        },
      });
    }

    return res.status(200).json({
      article: serializeArticleDetail(result.article, req.userId),
    });
  } catch (error) {
    console.error("Update article error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}

export async function deleteArticleController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const result = await deleteArticle(req.params.slug, req.userId!);

    if (result.type === "NOT_FOUND") {
      return res.status(404).json({
        errors: {
          article: ["not found"],
        },
      });
    }
    if (result.type === "FORBIDDEN") {
      return res.status(403).json({
        errors: {
          article: ["forbidden"],
        },
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete article error:", error);

    return res.status(500).json({
      errors: {
        body: ["Internal server error"],
      },
    });
  }
}
