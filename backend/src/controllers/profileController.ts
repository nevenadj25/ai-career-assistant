import type { Response } from "express";

import { pool } from "../config/db";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

/* =========================================================
   GET PROFILE
========================================================= */

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          location,
          linkedin,
          job_title,
          profile_photo
        FROM users
        WHERE id = $1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone || "",
      location: user.location || "",
      linkedin: user.linkedin || "",
      jobTitle: user.job_title || "",
      profilePhoto: user.profile_photo || "",
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Greška prilikom učitavanja profila.",
    });
  }
};

/* =========================================================
   UPDATE PROFILE
========================================================= */

export const updateProfile = async (
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

    const {
      firstName,
      lastName,
      phone,
      location,
      linkedin,
      jobTitle,
      profilePhoto,
    } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({
        message: "Ime i prezime su obavezni.",
      });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          phone = $3,
          location = $4,
          linkedin = $5,
          job_title = $6,
          profile_photo = $7
        WHERE id = $8
        RETURNING
          id,
          first_name,
          last_name,
          email,
          phone,
          location,
          linkedin,
          job_title,
          profile_photo
      `,
      [
        firstName.trim(),
        lastName.trim(),
        phone?.trim() || null,
        location?.trim() || null,
        linkedin?.trim() || null,
        jobTitle?.trim() || null,
        profilePhoto || null,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      message: "Profil je uspešno izmenjen.",

      profile: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone || "",
        location: user.location || "",
        linkedin: user.linkedin || "",
        jobTitle: user.job_title || "",
        profilePhoto: user.profile_photo || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Greška prilikom izmene profila.",
    });
  }
};
