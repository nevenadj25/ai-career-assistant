import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
console.log("ENV keys:", Object.keys(process.env));
console.log("Gemini key postoji:", !!process.env.GEMINI_API_KEY);
import cvRoutes from "./routes/cvRoutes";
import authRoutes from "./routes/authRoutes";
import coverLetterRoutes from "./routes/coverLetterRoutes";
import interviewRoutes from "./routes/interviewRoutes";
import { pool } from "./config/db";
import profileRoutes from "./routes/profileRoutes";

const app = express();

const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Test PostgreSQL konekcije
pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("PostgreSQL connected:", result.rows[0]);
  })
  .catch((error) => {
    console.error("PostgreSQL connection error:", error);
  });

// Test route
app.get("/", (_req, res) => {
  res.json({
    message: "AI Career Assistant API is running",
  });
});

// Routes
app.use("/api/cvs", cvRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cover-letters", coverLetterRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/profile", profileRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
