import { Router } from "express";

import {
  getProfileController,
  followProfileController,
  unfollowProfileController,
} from "../controllers/profile.controller";

import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/profiles/:username", optionalAuthMiddleware, getProfileController);

router.post(
  "/profiles/:username/follow",
  authMiddleware,
  followProfileController,
);

router.delete(
  "/profiles/:username/follow",
  authMiddleware,
  unfollowProfileController,
);

export default router;
