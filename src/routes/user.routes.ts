import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { login, register } from "../controllers/auth.controllers";
import { getCurrentUser, updateUser } from "../controllers/user.controllers";

const router = Router();

router.post("/users", register);

router.post("/users/login", login);

router.get("/user", authMiddleware, getCurrentUser);

router.put("/user", authMiddleware, updateUser);

export default router;
