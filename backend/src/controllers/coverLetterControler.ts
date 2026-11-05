import type { Response } from "express";
import { GoogleGenAI } from "@google/genai";

import { pool } from "../config/db";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

/*
 * =========================================================
 * GENERATE COVER LETTER
 * =========================================================
 */

export const generateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    /*
     * AUTH
     */

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    /*
     * GEMINI API KEY
     */

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "GEMINI_API_KEY nije podešen.",
      });
    }

    /*
     * REQUEST DATA
     */

    const {
      cvId,
      position,
      company,
      jobDescription,
      language = "en",
    } = req.body;

    const allowedLanguages = ["sr-latn", "sr-cyrl", "en"];

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        message: "Izabrani jezik nije podržan.",
      });
    }

    const languageInstruction =
      language === "sr-latn"
        ? "Write the entire cover letter in Serbian using Latin script."
        : language === "sr-cyrl"
          ? "Write the entire cover letter in Serbian using Cyrillic script."
          : "Write the entire cover letter in English.";

    if (!cvId || !position || !company || !jobDescription) {
      return res.status(400).json({
        message: "CV, pozicija, kompanija i opis posla su obavezni.",
      });
    }

    /*
     * =====================================================
     * 1. PROVERA DA CV PRIPADA KORISNIKU
     * =====================================================
     */

    const cvResult = await pool.query(
      `
        SELECT
          id,
          user_id,
          template
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [cvId, userId],
    );

    if (cvResult.rows.length === 0) {
      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    const cv = cvResult.rows[0];

    /*
     * =====================================================
     * 2. PERSONAL INFO
     * =====================================================
     */

    const personalInfoResult = await pool.query(
      `
          SELECT
            first_name,
            last_name,
            email,
            phone,
            address,
            linkedin,
            github,
            portfolio
          FROM cv_personal_info
          WHERE cv_id = $1
        `,
      [cvId],
    );

    /*
     * =====================================================
     * 3. EDUCATION
     * =====================================================
     */

    const educationResult = await pool.query(
      `
          SELECT
            school,
            degree,
            field,
            city,
            start_year,
            end_year
          FROM cv_education
          WHERE cv_id = $1
          ORDER BY id
        `,
      [cvId],
    );

    /*
     * =====================================================
     * 4. EXPERIENCE
     * =====================================================
     */

    const experienceResult = await pool.query(
      `
          SELECT
            company,
            position,
            location,
            start_date,
            end_date,
            description
          FROM cv_experience
          WHERE cv_id = $1
          ORDER BY id
        `,
      [cvId],
    );

    /*
     * =====================================================
     * 5. SKILLS
     * =====================================================
     */

    const skillsResult = await pool.query(
      `
          SELECT skill
          FROM cv_skills
          WHERE cv_id = $1
          ORDER BY id
        `,
      [cvId],
    );

    /*
     * =====================================================
     * 6. LANGUAGES
     * =====================================================
     */

    const languagesResult = await pool.query(
      `
          SELECT
            name,
            level
          FROM cv_languages
          WHERE cv_id = $1
          ORDER BY id
        `,
      [cvId],
    );

    /*
     * =====================================================
     * 7. PROJECTS
     * =====================================================
     */

    const projectsResult = await pool.query(
      `
          SELECT
            name,
            description,
            technologies,
            link
          FROM cv_projects
          WHERE cv_id = $1
          ORDER BY id
        `,
      [cvId],
    );

    /*
     * =====================================================
     * 8. CERTIFICATES
     * =====================================================
     */

    const certificatesResult = await pool.query(
      `
          SELECT
            name,
            issuer,
            date,
            link
          FROM cv_certificates
          WHERE cv_id = $1
          ORDER BY id
        `,
      [cvId],
    );

    /*
     * =====================================================
     * SASTAVLJANJE CV DATA OBJEKTA
     * =====================================================
     */

    const personalInfo = personalInfoResult.rows[0];

    if (!personalInfo) {
      return res.status(400).json({
        message: "Izabrani CV nema osnovne podatke.",
      });
    }

    const cvData = {
      personalInfo: {
        firstName: personalInfo.first_name ?? "",

        lastName: personalInfo.last_name ?? "",

        email: personalInfo.email ?? "",

        phone: personalInfo.phone ?? "",

        address: personalInfo.address ?? "",

        linkedIn: personalInfo.linkedin ?? "",

        github: personalInfo.github ?? "",

        portfolio: personalInfo.portfolio ?? "",
      },

      education: educationResult.rows.map((item) => ({
        school: item.school,
        degree: item.degree,
        field: item.field,
        city: item.city,
        startYear: item.start_year,
        endYear: item.end_year,
      })),

      experience: experienceResult.rows.map((item) => ({
        company: item.company,
        position: item.position,
        location: item.location,
        startDate: item.start_date,
        endDate: item.end_date,
        description: item.description,
      })),

      skills: skillsResult.rows.map((item) => item.skill),

      languages: languagesResult.rows.map((item) => ({
        name: item.name,
        level: item.level,
      })),

      projects: projectsResult.rows.map((item) => ({
        name: item.name,
        description: item.description,
        technologies: item.technologies,
        link: item.link,
      })),

      certificates: certificatesResult.rows.map((item) => ({
        name: item.name,
        issuer: item.issuer,
        date: item.date,
        link: item.link,
      })),

      template: cv.template,
    };

    /*
     * FULL NAME
     */

    const fullName =
      `${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`.trim();

    /*
     * DEBUG
     *
     * Ovo će nam sada pokazati
     * šta tačno šaljemo Geminiju.
     */

    console.log("COVER LETTER CV DATA:", cvData);

    /*
     * =====================================================
     * GEMINI
     * =====================================================
     */

    const ai = new GoogleGenAI({
      apiKey,
    });

    /*
     * PROMPT
     */

    const prompt = `
You are an expert career assistant and professional cover letter writer.

Write a professional and personalized cover letter for the candidate below.

LANGUAGE REQUIREMENT:
${languageInstruction}

- Apply the selected language to the complete generated letter.
- Do not translate proper names, company names, school names, project names, URLs, or technology names unless a natural localized form is already present in the source data.

IMPORTANT RULES:

- Use ONLY factual information contained in the candidate's CV.
- Do NOT invent companies.
- Do NOT invent jobs or work experience.
- Do NOT invent education.
- Do NOT invent skills.
- Do NOT invent technologies.
- Do NOT invent projects.
- Do NOT invent certificates.
- Do NOT invent achievements.
- Do NOT claim experience that the candidate does not have.
- If the candidate has no professional work experience, focus on education, projects, technical skills and motivation.
- Select the candidate's most relevant real qualifications for the provided job.
- Tailor the letter specifically to the job description.
- Do not simply repeat the entire CV.
- Explain naturally why the candidate could be a good fit.
- Keep the tone professional, confident and natural.
- Avoid exaggerated claims.
- Keep the letter concise.
- Do not use markdown.
- Do not use bullet points.
- Do not include explanations before or after the letter.
- Return ONLY the final cover letter.

CANDIDATE CV:

${JSON.stringify(cvData, null, 2)}

JOB APPLICATION:

Position:
${position}

Company:
${company}

Job description:
${jobDescription}

Write the final cover letter now.
`;

    /*
     * GEMINI REQUEST
     */

    console.log(`Generating cover letter for CV ${cvId}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    /*
     * RESPONSE
     */

    const generatedLetter = response.text?.trim();

    if (!generatedLetter) {
      return res.status(500).json({
        message: "AI nije generisao motivaciono pismo.",
      });
    }

    return res.status(200).json({
      message: "Motivaciono pismo je uspešno generisano.",

      letter: generatedLetter,
    });
  } catch (error: any) {
    console.error("Cover letter generation error:", error);

    /*
     * GEMINI QUOTA
     */

    if (
      error?.status === 429 ||
      error?.code === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return res.status(429).json({
        message:
          "Dostignut je trenutni limit AI servisa. Pokušajte ponovo kasnije.",
      });
    }

    /*
     * GEMINI 503
     */

    if (
      error?.status === 503 ||
      error?.code === 503 ||
      error?.message?.includes("503")
    ) {
      return res.status(503).json({
        message:
          "AI servis je trenutno preopterećen. Pokušajte ponovo za nekoliko trenutaka.",
      });
    }

    /*
     * OTHER ERROR
     */

    return res.status(500).json({
      message: "Greška prilikom generisanja motivacionog pisma.",

      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/*
 * =========================================================
 * SAVE COVER LETTER
 * =========================================================
 */

export const saveCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    /*
     * USER FROM JWT
     */

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    /*
     * REQUEST
     */

    const { cvId, fullName, position, company, jobDescription, content } =
      req.body;

    if (
      !cvId ||
      !fullName ||
      !position ||
      !company ||
      !jobDescription ||
      !content
    ) {
      return res.status(400).json({
        message: "Sva polja su obavezna.",
      });
    }

    /*
     * Provera da CV pripada korisniku.
     */

    const cvResult = await pool.query(
      `
        SELECT id
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [cvId, userId],
    );

    if (cvResult.rows.length === 0) {
      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    /*
     * SAVE
     */

    const result = await pool.query(
      `
        INSERT INTO cover_letters
        (
          user_id,
          full_name,
          position,
          company,
          job_description,
          content
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [userId, fullName, position, company, jobDescription, content],
    );

    return res.status(201).json({
      message: "Motivaciono pismo je uspešno sačuvano.",

      coverLetter: result.rows[0],
    });
  } catch (error) {
    console.error("Save cover letter error:", error);

    return res.status(500).json({
      message: "Greška prilikom čuvanja motivacionog pisma.",
    });
  }
};

/*
 * =========================================================
 * GET USER COVER LETTERS
 * =========================================================
 */

export const getCoverLetters = async (
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

    const result = await pool.query(
      `
        SELECT
          id,
          user_id,
          full_name,
          position,
          company,
          job_description,
          content,
          created_at
        FROM cover_letters
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId],
    );

    return res.status(200).json(
      result.rows.map((letter) => ({
        id: letter.id,
        userId: letter.user_id,
        fullName: letter.full_name,
        position: letter.position,
        company: letter.company,
        jobDescription: letter.job_description,
        content: letter.content,
        createdAt: letter.created_at,
      })),
    );
  } catch (error) {
    console.error("Get cover letters error:", error);

    return res.status(500).json({
      message: "Greška prilikom učitavanja motivacionih pisama.",
    });
  }
};
