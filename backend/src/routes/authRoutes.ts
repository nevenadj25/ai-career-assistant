import { Router } from "express";

import {
  register,
  login,
  changePassword,
  deleteAccount,
} from "../controllers/authController";

import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */

router.post("/register", register);

router.post("/login", login);

/* =========================================================
   PROTECTED ROUTES
========================================================= */

router.put("/change-password", authenticateToken, changePassword);

router.delete("/account", authenticateToken, deleteAccount);

export default router;
