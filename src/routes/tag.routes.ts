import { Router } from "express";

import { getTagsController } from "../controllers/tag.controller";

const router = Router();

router.get("/tags", getTagsController);

export default router;
