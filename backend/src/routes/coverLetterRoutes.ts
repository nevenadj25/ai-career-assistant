import { Router } from "express";

import {
  generateCoverLetter,
  saveCoverLetter,
  getCoverLetters,
} from "../controllers/coverLetterControler";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/*
 * POST /api/cover-letters/generate
 */
router.post("/generate", authenticateToken, generateCoverLetter);

/*
 * POST /api/cover-letters
 */
router.post("/", authenticateToken, saveCoverLetter);

router.get("/", authenticateToken, getCoverLetters);

export default router;
