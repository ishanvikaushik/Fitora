import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import { uploadImage } from "../controllers/upload.controller";

const router = Router();

router.post("/", authMiddleware, upload.single("image"), uploadImage);

export default router;
