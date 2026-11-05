import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "../config/db";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET nije podešen.");
  }

  return jwt.sign(
    {
      userId,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
};

/* =========================================================
   REGISTER
========================================================= */

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Sva polja su obavezna.",
      });
    }

    const existingUser = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
      `,
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Korisnik sa ovim emailom već postoji.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email
      `,
      [firstName, lastName, email, passwordHash],
    );

    const user = result.rows[0];

    const token = generateToken(user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Greška na serveru.",
    });
  }
};

/* =========================================================
   LOGIN
========================================================= */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email i lozinka su obavezni.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          password_hash
        FROM users
        WHERE email = $1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Pogrešan email ili lozinka.",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Pogrešan email ili lozinka.",
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Greška na serveru.",
    });
  }
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Trenutna i nova lozinka su obavezne.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Nova lozinka mora imati najmanje 6 karaktera.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "Nova lozinka mora biti različita od trenutne.",
      });
    }

    /*
      Pronalazimo trenutno prijavljenog korisnika.
    */

    const result = await pool.query(
      `
        SELECT
          id,
          password_hash
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

    /*
      Proveravamo da li je trenutna lozinka ispravna.
    */

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Trenutna lozinka nije ispravna.",
      });
    }

    /*
      Hashujemo novu lozinku.
    */

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    /*
      Menjamo lozinku u bazi.
    */

    await pool.query(
      `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
      `,
      [newPasswordHash, userId],
    );

    return res.status(200).json({
      message: "Lozinka je uspešno promenjena.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Greška prilikom promene lozinke.",
    });
  }
};

/* =========================================================
   DELETE ACCOUNT
========================================================= */

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const client = await pool.connect();

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    await client.query("BEGIN");

    /*
      Brisanjem korisnika očekujemo da povezani podaci imaju
      ON DELETE CASCADE foreign key ograničenja.

      Tako se zajedno sa korisnikom brišu njegovi CV-jevi,
      motivaciona pisma i ostali povezani podaci.
    */

    const result = await client.query(
      `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Nalog je uspešno obrisan.",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Greška prilikom brisanja naloga.",
    });
  } finally {
    client.release();
  }
};
