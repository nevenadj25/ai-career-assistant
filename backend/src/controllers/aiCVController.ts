import type { Response } from "express";

import { pool } from "../config/db";

import type { AuthenticatedRequest } from "../middleware/authMiddleware";

/*
 * =====================================================
 * SAVE AI CV VERSION
 * =====================================================
 */

export const saveAICVVersion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const cvId = Number(req.params.id);

    if (Number.isNaN(cvId)) {
      return res.status(400).json({
        message: "Nevažeći ID CV-ja.",
      });
    }

    const { data, design } = req.body;

    if (!data) {
      return res.status(400).json({
        message: "AI CV podaci su obavezni.",
      });
    }

    if (!design) {
      return res.status(400).json({
        message: "AI dizajn je obavezan.",
      });
    }

    /*
     * Proveravamo da li CV pripada
     * prijavljenom korisniku.
     */
    const existingCV = await pool.query(
      `
        SELECT id
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [cvId, userId],
    );

    if (existingCV.rows.length === 0) {
      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    /*
     * Čuvamo:
     *
     * - AI sadržaj
     * - AI dizajn
     * - vreme čuvanja
     *
     * Fotografija se nalazi unutar
     * data.personalInfo.photo.
     */
    await pool.query(
      `
        UPDATE cvs
        SET
          ai_content = $1,
          ai_design = $2,
          ai_generated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
          AND user_id = $4
      `,
      [JSON.stringify(data), JSON.stringify(design), cvId, userId],
    );

    return res.status(200).json({
      message: "AI CV je uspešno sačuvan.",
      cvId,
      data,
      design,
    });
  } catch (error) {
    console.error("Save AI CV version error:", error);

    return res.status(500).json({
      message: "Greška prilikom čuvanja AI CV-a.",
    });
  }
};

/*
 * =====================================================
 * GET SAVED AI CV VERSION
 * =====================================================
 */

export const getSavedAICVVersion = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const cvId = Number(req.params.id);

    if (Number.isNaN(cvId)) {
      return res.status(400).json({
        message: "Nevažeći ID CV-ja.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          ai_content,
          ai_design,
          ai_generated_at
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [cvId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    const cv = result.rows[0];

    if (!cv.ai_content || !cv.ai_design) {
      return res.status(404).json({
        message: "Ovaj CV nema sačuvanu AI verziju.",
      });
    }

    /*
     * Ako PostgreSQL kolona već vraća objekat,
     * koristimo direktno.
     *
     * Ako je TEXT, parsiramo JSON.
     */
    const data =
      typeof cv.ai_content === "string"
        ? JSON.parse(cv.ai_content)
        : cv.ai_content;

    const design =
      typeof cv.ai_design === "string"
        ? JSON.parse(cv.ai_design)
        : cv.ai_design;

    return res.status(200).json({
      cvId: cv.id,
      data,
      design,
      generatedAt: cv.ai_generated_at,
    });
  } catch (error) {
    console.error("Get AI CV version error:", error);

    return res.status(500).json({
      message: "Greška prilikom učitavanja AI CV-a.",
    });
  }
};
