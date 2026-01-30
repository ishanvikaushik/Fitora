import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { generateOutfit } from "../controllers/outfit.controller";

const router = Router();

router.post("/generate", authMiddleware, generateOutfit);

export default router;
