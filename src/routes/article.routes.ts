import { Router } from "express";

import {
  createArticleController,
  listArticlesController,
  getArticleController,
  updateArticleController,
  deleteArticleController,
} from "../controllers/article.controller";

import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";
import {
  favoriteArticleController,
  unfavoriteArticleController,
} from "../controllers/favoriteArticle.controller";
import { feedArticlesController } from "../controllers/feed.controller";

const router = Router();

router.post("/articles", authMiddleware, createArticleController);

router.get("/articles", optionalAuthMiddleware, listArticlesController);

router.get("/articles/feed", authMiddleware, feedArticlesController);

router.post(
  "/articles/:slug/favorite",
  authMiddleware,
  favoriteArticleController,
);

router.delete(
  "/articles/:slug/favorite",
  authMiddleware,
  unfavoriteArticleController,
);

router.get("/articles/:slug", optionalAuthMiddleware, getArticleController);

router.put("/articles/:slug", authMiddleware, updateArticleController);

router.delete("/articles/:slug", authMiddleware, deleteArticleController);

export default router;
