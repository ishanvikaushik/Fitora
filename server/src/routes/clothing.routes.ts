import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { addClothing, getClothes } from "../controllers/clothing.controller";

const router = Router();

router.post("/", authMiddleware, addClothing);
router.get("/", authMiddleware, getClothes);

export default router;
