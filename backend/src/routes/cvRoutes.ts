import { Router } from "express";

import {
  createCV,
  getCVs,
  getCVById,
  updateCV,
  deleteCV,
  generateCV,
  saveAICVVersion,
} from "../controllers/cvController";

import { getSavedAICVVersion } from "../controllers/aiCVController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/*
 * =====================================================
 * AI
 * =====================================================
 */

/*
 * Gemini generisanje.
 *
 * Samo generiše preview.
 * Ne menja postojeći CV u bazi.
 */
router.post("/generate", authenticateToken, generateCV);

/*
 * Čuvanje trenutno generisane AI verzije
 * kao POTPUNO NOVOG CV-ja.
 *
 * Originalni CV ostaje netaknut.
 */
router.post("/:id/ai-version", authenticateToken, saveAICVVersion);

/*
 * Učitavanje sačuvane AI verzije.
 *
 * Ovo za sada zadržavamo jer ga History koristi
 * kada otvaramo AI-generisani CV.
 */
router.get("/:id/ai-version", authenticateToken, getSavedAICVVersion);

/*
 * =====================================================
 * NORMAL CV CRUD
 * =====================================================
 */

router.post("/", authenticateToken, createCV);

router.get("/", authenticateToken, getCVs);

router.get("/:id", authenticateToken, getCVById);

router.put("/:id", authenticateToken, updateCV);

router.delete("/:id", authenticateToken, deleteCV);

export default router;
