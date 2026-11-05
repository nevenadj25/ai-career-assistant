import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../config/db";

export const generateInterview = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "GEMINI_API_KEY nije podešen.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const { userId, position, technologies, numberOfQuestions, difficulty } =
      req.body;

    if (!userId || !position || !technologies || !numberOfQuestions) {
      return res.status(400).json({
        message: "Sva polja su obavezna.",
      });
    }

    const prompt = `
Generate ${numberOfQuestions} technical interview questions.

Target position:
${position}

Technologies and skills selected by the candidate:
${technologies.join(", ")}

Interview difficulty:
${difficulty}

Create an interview specifically designed for the target position.

Important rules:

1. The questions must be relevant to the target position.
2. Use the selected technologies and skills as the main technical topics.
3. Do NOT ask questions about technologies that were not selected unless they are a fundamental concept directly related to the target position.
4. The interview should feel like a real job interview, not a list of random technology questions.
5. Mix theoretical and practical questions.
6. Include questions that test problem-solving and understanding, not only memorization.
7. Avoid asking the same thing in different ways.
8. If multiple technologies are selected, distribute the questions reasonably between them.
9. Some questions can combine multiple selected technologies when that would make sense in a real job interview.

Difficulty rules:

- Beginner:
  Ask fundamental questions and simple practical questions.
  Focus on basic concepts and understanding.

- Intermediate:
  Ask questions that require deeper understanding and practical application.
  Include debugging, architecture and real-world scenarios where appropriate.

- Advanced:
  Ask challenging questions that require strong technical understanding.
  Include complex scenarios, architecture, optimization, debugging and trade-offs where appropriate.

- Mixed:
  Combine beginner, intermediate and advanced questions.

Examples:

If the position is "Frontend Developer" and the technologies are:
React, TypeScript, JavaScript

Good questions could include:
- Explain the difference between state and props in React.
- How does useEffect work and when would you use it?
- What are the benefits of TypeScript in a React application?
- How would you optimize a React application that is rendering slowly?

If the position is "QA Engineer" and the technologies are:
Software Testing, Selenium, SQL, Postman

Good questions could include:
- What is the difference between functional and non-functional testing?
- How would you create an automated test using Selenium?
- How would you test a REST API using Postman?
- Write or explain a SQL query that verifies data after an API request.

If the position is "Cloud Engineer" and the technologies are:
AWS, Docker, Kubernetes

Good questions could include:
- What is an EC2 instance?
- What problem does Docker solve?
- Explain the difference between a Docker container and a virtual machine.
- How would you deploy and scale an application using Kubernetes?

Return ONLY a valid JSON array of strings.

Example:
[
  "What is the difference between let, const and var in JavaScript?",
  "Explain how useState works in React.",
  "How would you optimize a React application?"
]

Do not include markdown.
Do not include explanations outside the JSON array.
Generate in serbian language.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const generatedText = response.text;

    if (!generatedText) {
      return res.status(500).json({
        message: "AI nije generisao pitanja.",
      });
    }

    const cleanedText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const questions = JSON.parse(cleanedText);

    const interviewResult = await pool.query(
      `
      INSERT INTO interviews
      (
        user_id,
        position,
        technologies,
        number_of_questions,
        difficulty
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        userId,
        position,
        technologies.join(", "),
        numberOfQuestions,
        difficulty,
      ],
    );

    const interview = interviewResult.rows[0];

    for (let i = 0; i < questions.length; i++) {
      await pool.query(
        `
        INSERT INTO interview_questions
        (
          interview_id,
          question_number,
          question
        )
        VALUES ($1, $2, $3)
        `,
        [interview.id, i + 1, questions[i]],
      );
    }

    return res.status(201).json({
      message: "Intervju je uspešno generisan.",
      interviewId: interview.id,
      questions,
    });
  } catch (error) {
    console.error("Interview generation error:", error);

    return res.status(500).json({
      message: "Greška prilikom generisanja intervjua.",
    });
  }
};

export const saveInterviewAnswer = async (req: Request, res: Response) => {
  try {
    const { interviewId, questionNumber, answer } = req.body;

    if (!interviewId || !questionNumber || !answer) {
      return res.status(400).json({
        message: "Sva polja su obavezna.",
      });
    }

    const result = await pool.query(
      `
      UPDATE interview_questions
      SET answer = $1
      WHERE interview_id = $2
      AND question_number = $3
      RETURNING *
      `,
      [answer, interviewId, questionNumber],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Pitanje nije pronađeno.",
      });
    }

    return res.status(200).json({
      message: "Odgovor je sačuvan.",
      question: result.rows[0],
    });
  } catch (error) {
    console.error("Save interview answer error:", error);

    return res.status(500).json({
      message: "Greška prilikom čuvanja odgovora.",
    });
  }
};

export const evaluateInterview = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "GEMINI_API_KEY nije podešen.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        message: "interviewId je obavezan.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        question_number,
        question,
        answer
      FROM interview_questions
      WHERE interview_id = $1
      ORDER BY question_number
      `,
      [interviewId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Pitanja za ovaj intervju nisu pronađena.",
      });
    }

    const questionsAndAnswers = result.rows
      .map(
        (item) => `
Question ${item.question_number}:
${item.question}

Candidate answer:
${item.answer || "(No answer)"}
`,
      )
      .join("\n");

    const prompt = `
Evaluate a technical job interview.

You are an experienced technical interviewer.

Interview questions and candidate answers:

${questionsAndAnswers}

Evaluate every answer based on:
- correctness
- relevance
- understanding of the topic
- technical knowledge
- clarity

Important:
- An answer such as "asd", "test", "xyz", random text or an irrelevant answer should receive a score of 0.
- Do not give a high score just because the candidate wrote something.
- Do not invent information that is not present in the candidate's answer.
- Be honest and strict but fair.

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "performance": "Needs improvement",
  "feedback": [
    "Feedback point 1",
    "Feedback point 2",
    "Feedback point 3"
  ],
  "answers": [
    {
      "questionNumber": 1,
      "score": 0,
      "feedback": "Short explanation of the answer evaluation."
    }
  ]
}

The score must be an integer from 0 to 100.

Performance must be one of:
- "Excellent"
- "Good"
- "Average"
- "Needs improvement"

For each question, score the answer from 0 to 10.

Calculate the overall score based on the average of all individual answer scores.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const generatedText = response.text;

    if (!generatedText) {
      return res.status(500).json({
        message: "AI nije generisao evaluaciju.",
      });
    }

    const cleanedText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const evaluation = JSON.parse(cleanedText);

    return res.status(200).json({
      message: "Intervju je uspešno ocenjen.",
      evaluation,
    });
  } catch (error) {
    console.error("Interview evaluation error:", error);

    return res.status(500).json({
      message: "Greška prilikom evaluacije intervjua.",
    });
  }
};
