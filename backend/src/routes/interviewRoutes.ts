import { Router } from "express";

import {
  generateInterview,
  saveInterviewAnswer,
  evaluateInterview,
} from "../controllers/interviewController";

const router = Router();

router.post("/generate", generateInterview);
router.put("/answer", saveInterviewAnswer);
router.post("/evaluate", evaluateInterview);

export default router;
