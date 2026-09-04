import { Router } from "express";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controllers";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/articles/:slug/comments", authMiddleware, createComment);

router.get("/articles/:slug/comments", optionalAuthMiddleware, getComments);

router.delete(
  "/articles/:slug/comments/:commentId",
  authMiddleware,
  deleteComment,
);

export default router;
