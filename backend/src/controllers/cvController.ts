import type { Response } from "express";

import { pool } from "../config/db";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import type {
  CVData,
  Education,
  Experience,
  Project,
  Certificate,
  Language,
} from "../types/cv";
import { GoogleGenAI } from "@google/genai";

/*
 * CREATE CV
 */
export const createCV = async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const cvData = req.body as CVData;

    // Provera osnovne strukture
    if (!cvData.personalInfo || !cvData.template) {
      return res.status(400).json({
        message: "Nedostaju osnovni podaci CV-ja.",
      });
    }

    await client.query("BEGIN");

    /*
     * 1. Kreiramo CV
     */
    const cvResult = await client.query(
      `
        INSERT INTO cvs (
          user_id,
          template
        )
        VALUES ($1, $2)
        RETURNING id, user_id, template, created_at, updated_at
      `,
      [userId, cvData.template],
    );

    const cv = cvResult.rows[0];

    /*
     * 2. Personal info
     */
    await client.query(
      `
        INSERT INTO cv_personal_info (
          cv_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          linkedin,
          github,
          portfolio,
          photo
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `,
      [
        cv.id,
        cvData.personalInfo.firstName,
        cvData.personalInfo.lastName,
        cvData.personalInfo.email,
        cvData.personalInfo.phone,
        cvData.personalInfo.address,
        cvData.personalInfo.linkedIn,
        cvData.personalInfo.github,
        cvData.personalInfo.portfolio,
        cvData.personalInfo.photo || "",
      ],
    );

    /*
     * 3. Education
     */
    for (const education of cvData.education ?? []) {
      await client.query(
        `
          INSERT INTO cv_education (
            cv_id,
            school,
            degree,
            field,
            city,
            start_year,
            end_year
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          cv.id,
          education.school,
          education.degree,
          education.field,
          education.city,
          education.startYear,
          education.endYear,
        ],
      );
    }

    /*
     * 4. Experience
     */
    for (const experience of cvData.experience ?? []) {
      await client.query(
        `
          INSERT INTO cv_experience (
            cv_id,
            company,
            position,
            location,
            start_date,
            end_date,
            description
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          cv.id,
          experience.company,
          experience.position,
          experience.location,
          experience.startDate,
          experience.endDate,
          experience.description,
        ],
      );
    }

    /*
     * 5. Skills
     */
    for (const skill of cvData.skills ?? []) {
      await client.query(
        `
          INSERT INTO cv_skills (
            cv_id,
            skill
          )
          VALUES ($1, $2)
        `,
        [cv.id, skill],
      );
    }

    /*
     * 6. Languages
     */
    for (const language of cvData.languages ?? []) {
      await client.query(
        `
          INSERT INTO cv_languages (
            cv_id,
            name,
            level
          )
          VALUES ($1, $2, $3)
        `,
        [cv.id, language.name, language.level],
      );
    }

    /*
     * 7. Projects
     */
    for (const project of cvData.projects ?? []) {
      await client.query(
        `
          INSERT INTO cv_projects (
            cv_id,
            name,
            description,
            technologies,
            link
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          cv.id,
          project.name,
          project.description,
          project.technologies,
          project.link,
        ],
      );
    }

    /*
     * 8. Certificates
     */
    for (const certificate of cvData.certificates ?? []) {
      await client.query(
        `
          INSERT INTO cv_certificates (
            cv_id,
            name,
            issuer,
            date,
            link
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          cv.id,
          certificate.name,
          certificate.issuer,
          certificate.date,
          certificate.link,
        ],
      );
    }

    /*
     * Sve je prošlo
     */
    await client.query("COMMIT");

    return res.status(201).json({
      id: cv.id,
      userId: cv.user_id,
      data: cvData,
      createdAt: cv.created_at,
      updatedAt: cv.updated_at,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create CV error:", error);

    return res.status(500).json({
      message: "Greška prilikom čuvanja CV-a.",
    });
  } finally {
    client.release();
  }
};

/*
 * GET ALL CVS
 */
export const getCVs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const cvsResult = await pool.query(
      `
        SELECT
          id,
          user_id,
          template,
          language,
          source_cv_id,
          created_at,
          updated_at
        FROM cvs
        WHERE user_id = $1
        ORDER BY id DESC
      `,
      [userId],
    );

    const cvs = [];

    for (const cv of cvsResult.rows) {
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
            portfolio,
            photo
          FROM cv_personal_info
          WHERE cv_id = $1
        `,
        [cv.id],
      );

      const educationResult = await pool.query(
        `
          SELECT
            id,
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
        [cv.id],
      );

      const experienceResult = await pool.query(
        `
          SELECT
            id,
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
        [cv.id],
      );

      const skillsResult = await pool.query(
        `
          SELECT
            id,
            skill
          FROM cv_skills
          WHERE cv_id = $1
          ORDER BY id
        `,
        [cv.id],
      );

      const languagesResult = await pool.query(
        `
          SELECT
            id,
            name,
            level
          FROM cv_languages
          WHERE cv_id = $1
          ORDER BY id
        `,
        [cv.id],
      );

      const projectsResult = await pool.query(
        `
          SELECT
            id,
            name,
            description,
            technologies,
            link
          FROM cv_projects
          WHERE cv_id = $1
          ORDER BY id
        `,
        [cv.id],
      );

      const certificatesResult = await pool.query(
        `
          SELECT
            id,
            name,
            issuer,
            date,
            link
          FROM cv_certificates
          WHERE cv_id = $1
          ORDER BY id
        `,
        [cv.id],
      );

      const personalInfo = personalInfoResult.rows[0];

      cvs.push({
        id: cv.id,
        userId: cv.user_id,
        data: {
          personalInfo: personalInfo
            ? {
                firstName: personalInfo.first_name,
                lastName: personalInfo.last_name,
                email: personalInfo.email,
                phone: personalInfo.phone,
                address: personalInfo.address,
                linkedIn: personalInfo.linkedin,
                github: personalInfo.github,
                portfolio: personalInfo.portfolio,
                photo: personalInfo.photo || "",
              }
            : null,

          education: educationResult.rows.map((item) => ({
            id: item.id,
            school: item.school,
            degree: item.degree,
            field: item.field,
            city: item.city,
            startYear: item.start_year,
            endYear: item.end_year,
          })),

          experience: experienceResult.rows.map((item) => ({
            id: item.id,
            company: item.company,
            position: item.position,
            location: item.location,
            startDate: item.start_date,
            endDate: item.end_date,
            description: item.description,
          })),

          skills: skillsResult.rows.map((item) => item.skill),

          languages: languagesResult.rows.map((item) => ({
            id: item.id,
            name: item.name,
            level: item.level,
          })),

          projects: projectsResult.rows.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            technologies: item.technologies,
            link: item.link,
          })),

          certificates: certificatesResult.rows.map((item) => ({
            id: item.id,
            name: item.name,
            issuer: item.issuer,
            date: item.date,
            link: item.link,
          })),

          template: cv.template,
        },

        language: cv.language ?? null,
        sourceCvId: cv.source_cv_id ?? null,
        createdAt: cv.created_at,
        updatedAt: cv.updated_at,
      });
    }

    return res.status(200).json(cvs);
  } catch (error) {
    console.error("Get CVs error:", error);

    return res.status(500).json({
      message: "Greška prilikom učitavanja CV-jeva.",
    });
  }
};

/*
 * GET CV BY ID
 */
export const getCVById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Nevažeći ID CV-ja.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          user_id,
          template,
          language,
          source_cv_id,
          created_at,
          updated_at
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    const cv = result.rows[0];
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
          portfolio,
          photo
        FROM cv_personal_info
        WHERE cv_id = $1
      `,
      [cv.id],
    );

    const educationResult = await pool.query(
      `
        SELECT
          id,
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
      [cv.id],
    );

    const experienceResult = await pool.query(
      `
        SELECT
          id,
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
      [cv.id],
    );

    const skillsResult = await pool.query(
      `
        SELECT
          id,
          skill
        FROM cv_skills
        WHERE cv_id = $1
        ORDER BY id
      `,
      [cv.id],
    );

    const languagesResult = await pool.query(
      `
        SELECT
          id,
          name,
          level
        FROM cv_languages
        WHERE cv_id = $1
        ORDER BY id
      `,
      [cv.id],
    );

    const projectsResult = await pool.query(
      `
        SELECT
          id,
          name,
          description,
          technologies,
          link
        FROM cv_projects
        WHERE cv_id = $1
        ORDER BY id
      `,
      [cv.id],
    );

    /*
     * Certificates
     */
    const certificatesResult = await pool.query(
      `
        SELECT
          id,
          name,
          issuer,
          date,
          link
        FROM cv_certificates
        WHERE cv_id = $1
        ORDER BY id
      `,
      [cv.id],
    );

    const personalInfo = personalInfoResult.rows[0];

    return res.status(200).json({
      id: cv.id,
      userId: cv.user_id,
      language: cv.language ?? null,
      sourceCvId: cv.source_cv_id ?? null,

      data: {
        personalInfo: personalInfo
          ? {
              firstName: personalInfo.first_name,
              lastName: personalInfo.last_name,
              email: personalInfo.email,
              phone: personalInfo.phone,
              address: personalInfo.address,
              linkedIn: personalInfo.linkedin,
              github: personalInfo.github,
              portfolio: personalInfo.portfolio,
              photo: personalInfo.photo || "",
            }
          : null,

        education: educationResult.rows.map((item) => ({
          id: item.id,
          school: item.school,
          degree: item.degree,
          field: item.field,
          city: item.city,
          startYear: item.start_year,
          endYear: item.end_year,
        })),

        experience: experienceResult.rows.map((item) => ({
          id: item.id,
          company: item.company,
          position: item.position,
          location: item.location,
          startDate: item.start_date,
          endDate: item.end_date,
          description: item.description,
        })),

        skills: skillsResult.rows.map((item) => item.skill),

        languages: languagesResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          level: item.level,
        })),

        projects: projectsResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          technologies: item.technologies,
          link: item.link,
        })),

        certificates: certificatesResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          issuer: item.issuer,
          date: item.date,
          link: item.link,
        })),

        template: cv.template,
      },

      createdAt: cv.created_at,
      updatedAt: cv.updated_at,
    });
  } catch (error) {
    console.error("Get CV by ID error:", error);

    return res.status(500).json({
      message: "Greška prilikom učitavanja CV-ja.",
    });
  }
};

export const updateCV = async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Nevažeći ID CV-ja.",
      });
    }

    const cvData = req.body as CVData;

    await client.query("BEGIN");

    const existingCV = await client.query(
      `
        SELECT id
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [id, userId],
    );

    if (existingCV.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    await client.query(
      `
        UPDATE cvs
        SET
          template = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND user_id = $3
      `,
      [cvData.template, id, userId],
    );

    await client.query(
      `
        UPDATE cv_personal_info
        SET
          first_name = $1,
          last_name = $2,
          email = $3,
          phone = $4,
          address = $5,
          linkedin = $6,
          github = $7,
          portfolio = $8,
          photo=$9
        WHERE cv_id = $10
      `,
      [
        cvData.personalInfo.firstName,
        cvData.personalInfo.lastName,
        cvData.personalInfo.email,
        cvData.personalInfo.phone,
        cvData.personalInfo.address,
        cvData.personalInfo.linkedIn,
        cvData.personalInfo.github,
        cvData.personalInfo.portfolio,
        cvData.personalInfo.photo || "",
        id,
      ],
    );

    await client.query(`DELETE FROM cv_education WHERE cv_id = $1`, [id]);
    await client.query(`DELETE FROM cv_experience WHERE cv_id = $1`, [id]);
    await client.query(`DELETE FROM cv_skills WHERE cv_id = $1`, [id]);
    await client.query(`DELETE FROM cv_languages WHERE cv_id = $1`, [id]);
    await client.query(`DELETE FROM cv_projects WHERE cv_id = $1`, [id]);
    await client.query(`DELETE FROM cv_certificates WHERE cv_id = $1`, [id]);

    for (const education of cvData.education ?? []) {
      await client.query(
        `
          INSERT INTO cv_education (
            cv_id,
            school,
            degree,
            field,
            city,
            start_year,
            end_year
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          id,
          education.school,
          education.degree,
          education.field,
          education.city,
          education.startYear,
          education.endYear,
        ],
      );
    }

    for (const experience of cvData.experience ?? []) {
      await client.query(
        `
          INSERT INTO cv_experience (
            cv_id,
            company,
            position,
            location,
            start_date,
            end_date,
            description
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          id,
          experience.company,
          experience.position,
          experience.location,
          experience.startDate,
          experience.endDate,
          experience.description,
        ],
      );
    }

    for (const skill of cvData.skills ?? []) {
      await client.query(
        `
          INSERT INTO cv_skills (
            cv_id,
            skill
          )
          VALUES ($1, $2)
        `,
        [id, skill],
      );
    }
    for (const language of cvData.languages ?? []) {
      await client.query(
        `
          INSERT INTO cv_languages (
            cv_id,
            name,
            level
          )
          VALUES ($1, $2, $3)
        `,
        [id, language.name, language.level],
      );
    }

    for (const project of cvData.projects ?? []) {
      await client.query(
        `
          INSERT INTO cv_projects (
            cv_id,
            name,
            description,
            technologies,
            link
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          id,
          project.name,
          project.description,
          project.technologies,
          project.link,
        ],
      );
    }

    for (const certificate of cvData.certificates ?? []) {
      await client.query(
        `
          INSERT INTO cv_certificates (
            cv_id,
            name,
            issuer,
            date,
            link
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          id,
          certificate.name,
          certificate.issuer,
          certificate.date,
          certificate.link,
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "CV uspešno ažuriran.",
      id,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update CV error:", error);

    return res.status(500).json({
      message: "Greška prilikom ažuriranja CV-ja.",
    });
  } finally {
    client.release();
  }
};

export const deleteCV = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Nevažeći ID CV-ja.",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM cvs
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "CV nije pronađen.",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete CV error:", error);

    return res.status(500).json({
      message: "Greška prilikom brisanja CV-ja.",
    });
  }
};

const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateWithRetry = async (ai: GoogleGenAI, prompt: string) => {
  const models = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash"];

  let lastError: unknown;

  for (const model of models) {
    try {
      console.log(`Pokušavam model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              data: {
                type: "object",

                properties: {
                  personalInfo: {
                    type: "object",

                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      address: { type: "string" },
                      linkedIn: { type: "string" },
                      github: { type: "string" },
                      portfolio: { type: "string" },
                    },

                    required: [
                      "firstName",
                      "lastName",
                      "email",
                      "phone",
                      "address",
                      "linkedIn",
                      "github",
                      "portfolio",
                    ],
                  },

                  education: {
                    type: "array",
                    items: {
                      type: "object",

                      properties: {
                        school: { type: "string" },
                        degree: { type: "string" },
                        field: { type: "string" },
                        city: { type: "string" },
                        startYear: { type: "string" },
                        endYear: { type: "string" },
                      },

                      required: [
                        "school",
                        "degree",
                        "field",
                        "city",
                        "startYear",
                        "endYear",
                      ],
                    },
                  },

                  experience: {
                    type: "array",
                    items: {
                      type: "object",

                      properties: {
                        company: { type: "string" },
                        position: { type: "string" },
                        location: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        description: { type: "string" },
                      },

                      required: [
                        "company",
                        "position",
                        "location",
                        "startDate",
                        "endDate",
                        "description",
                      ],
                    },
                  },

                  skills: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  languages: {
                    type: "array",
                    items: {
                      type: "object",

                      properties: {
                        name: { type: "string" },
                        level: { type: "string" },
                      },

                      required: ["name", "level"],
                    },
                  },

                  projects: {
                    type: "array",
                    items: {
                      type: "object",

                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        technologies: { type: "string" },
                        link: { type: "string" },
                      },

                      required: ["name", "description", "technologies", "link"],
                    },
                  },

                  certificates: {
                    type: "array",
                    items: {
                      type: "object",

                      properties: {
                        name: { type: "string" },
                        issuer: { type: "string" },
                        date: { type: "string" },
                        link: { type: "string" },
                      },

                      required: ["name", "issuer", "date", "link"],
                    },
                  },

                  template: {
                    type: "string",
                    enum: ["modern", "classic", "minimal"],
                  },
                },

                required: [
                  "personalInfo",
                  "education",
                  "experience",
                  "skills",
                  "languages",
                  "projects",
                  "certificates",
                  "template",
                ],
              },

              design: {
                type: "object",

                properties: {
                  layout: {
                    type: "string",
                    enum: ["single-column", "two-column", "sidebar"],
                  },

                  sidebarPosition: {
                    type: "string",
                    enum: ["left", "right"],
                  },

                  sidebarWidth: {
                    type: "number",
                  },

                  primaryColor: {
                    type: "string",
                  },

                  accentColor: {
                    type: "string",
                  },

                  font: {
                    type: "string",
                    enum: ["Inter", "Roboto", "Poppins", "Georgia"],
                  },

                  photo: {
                    type: "object",

                    properties: {
                      visible: {
                        type: "boolean",
                      },

                      position: {
                        type: "string",
                        enum: ["header", "sidebar"],
                      },

                      shape: {
                        type: "string",
                        enum: ["circle", "rounded", "square"],
                      },

                      size: {
                        type: "string",
                        enum: ["small", "medium", "large"],
                      },
                    },

                    required: ["visible", "position", "shape", "size"],
                  },

                  header: {
                    type: "object",

                    properties: {
                      alignment: {
                        type: "string",
                        enum: ["left", "center"],
                      },

                      style: {
                        type: "string",
                        enum: ["minimal", "bold", "accent"],
                      },
                    },

                    required: ["alignment", "style"],
                  },

                  mainSections: {
                    type: "array",

                    items: {
                      type: "string",
                      enum: [
                        "contact",
                        "experience",
                        "education",
                        "skills",
                        "languages",
                        "projects",
                        "certificates",
                      ],
                    },
                  },

                  sideSections: {
                    type: "array",

                    items: {
                      type: "string",
                      enum: [
                        "contact",
                        "experience",
                        "education",
                        "skills",
                        "languages",
                        "projects",
                        "certificates",
                      ],
                    },
                  },

                  headingStyle: {
                    type: "string",
                    enum: ["line", "accent", "minimal"],
                  },

                  skillsStyle: {
                    type: "string",
                    enum: ["list", "badges", "bars"],
                  },

                  experienceStyle: {
                    type: "string",
                    enum: ["standard", "timeline", "compact"],
                  },

                  spacing: {
                    type: "string",
                    enum: ["compact", "normal", "spacious"],
                  },
                },

                required: [
                  "layout",
                  "sidebarPosition",
                  "sidebarWidth",
                  "primaryColor",
                  "accentColor",
                  "font",
                  "photo",
                  "header",
                  "mainSections",
                  "sideSections",
                  "headingStyle",
                  "skillsStyle",
                  "experienceStyle",
                  "spacing",
                ],
              },
            },

            required: ["data", "design"],
          },
        },
      });

      console.log(`Uspeo model: ${model}`);

      return response;
    } catch (error: any) {
      lastError = error;

      console.error(`Model ${model} nije uspeo:`, error?.message);

      if (error?.status === 503) {
        console.log(
          `${model} je trenutno preopterećen. Prelazim na sledeći model...`,
        );

        await wait(1000);

        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

export const saveAICVVersion = async (
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

    const sourceCVId = Number(req.params.id);

    if (Number.isNaN(sourceCVId)) {
      return res.status(400).json({
        message: "Nevažeći ID izvornog CV-ja.",
      });
    }

    const {
      data,
      design,
      language = "en",
    } = req.body as {
      data?: CVData;
      design?: unknown;
      language?: "sr-latn" | "sr-cyrl" | "en";
    };

    if (!data || !design) {
      return res.status(400).json({
        message: "AI podaci i dizajn CV-ja su obavezni.",
      });
    }

    const allowedLanguages = ["sr-latn", "sr-cyrl", "en"];

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        message: "Izabrani jezik nije podržan.",
      });
    }

    const sourceCVResult = await client.query(
      `
        SELECT id
        FROM cvs
        WHERE id = $1
          AND user_id = $2
      `,
      [sourceCVId, userId],
    );

    if (sourceCVResult.rows.length === 0) {
      return res.status(404).json({
        message: "Izvorni CV nije pronađen.",
      });
    }

    if (!data.personalInfo || !data.template) {
      return res.status(400).json({
        message: "Nedostaju osnovni podaci generisanog CV-ja.",
      });
    }

    await client.query("BEGIN");

    const newCVResult = await client.query(
      `
        INSERT INTO cvs (
          user_id,
          template,
          language,
          source_cv_id,
          ai_content,
          ai_design,
          ai_generated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING
          id,
          user_id,
          template,
          language,
          source_cv_id,
          created_at,
          updated_at
      `,
      [
        userId,
        data.template,
        language,
        sourceCVId,
        JSON.stringify(data),
        JSON.stringify(design),
      ],
    );

    const newCV = newCVResult.rows[0];

    await client.query(
      `
        INSERT INTO cv_personal_info (
          cv_id,
          first_name,
          last_name,
          email,
          phone,
          address,
          linkedin,
          github,
          portfolio,
          photo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        newCV.id,
        data.personalInfo.firstName ?? "",
        data.personalInfo.lastName ?? "",
        data.personalInfo.email ?? "",
        data.personalInfo.phone ?? "",
        data.personalInfo.address ?? "",
        data.personalInfo.linkedIn ?? "",
        data.personalInfo.github ?? "",
        data.personalInfo.portfolio ?? "",
        data.personalInfo.photo ?? "",
      ],
    );

    for (const education of data.education ?? []) {
      await client.query(
        `
          INSERT INTO cv_education (
            cv_id,
            school,
            degree,
            field,
            city,
            start_year,
            end_year
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          newCV.id,
          education.school ?? "",
          education.degree ?? "",
          education.field ?? "",
          education.city ?? "",
          education.startYear ?? "",
          education.endYear ?? "",
        ],
      );
    }

    for (const experience of data.experience ?? []) {
      await client.query(
        `
          INSERT INTO cv_experience (
            cv_id,
            company,
            position,
            location,
            start_date,
            end_date,
            description
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          newCV.id,
          experience.company ?? "",
          experience.position ?? "",
          experience.location ?? "",
          experience.startDate ?? "",
          experience.endDate ?? "",
          experience.description ?? "",
        ],
      );
    }

    for (const skill of data.skills ?? []) {
      await client.query(
        `
          INSERT INTO cv_skills (
            cv_id,
            skill
          )
          VALUES ($1, $2)
        `,
        [newCV.id, skill],
      );
    }
    for (const item of data.languages ?? []) {
      await client.query(
        `
          INSERT INTO cv_languages (
            cv_id,
            name,
            level
          )
          VALUES ($1, $2, $3)
        `,
        [newCV.id, item.name ?? "", item.level ?? ""],
      );
    }

    for (const project of data.projects ?? []) {
      await client.query(
        `
          INSERT INTO cv_projects (
            cv_id,
            name,
            description,
            technologies,
            link
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          newCV.id,
          project.name ?? "",
          project.description ?? "",
          project.technologies ?? "",
          project.link ?? "",
        ],
      );
    }
    for (const certificate of data.certificates ?? []) {
      await client.query(
        `
          INSERT INTO cv_certificates (
            cv_id,
            name,
            issuer,
            date,
            link
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          newCV.id,
          certificate.name ?? "",
          certificate.issuer ?? "",
          certificate.date ?? "",
          certificate.link ?? "",
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Nova verzija CV-ja je uspešno sačuvana.",
      cvId: newCV.id,
      sourceCvId: newCV.source_cv_id,
      language: newCV.language,
      data,
      design,
      createdAt: newCV.created_at,
      updatedAt: newCV.updated_at,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Save AI CV as new CV error:", error);

    return res.status(500).json({
      message: "Greška prilikom čuvanja nove verzije CV-ja.",
    });
  } finally {
    client.release();
  }
};
export const generateCV = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY nije podešen.");

      return res.status(500).json({
        message: "GEMINI_API_KEY nije podešen.",
      });
    }

    const {
      cvId,
      data,
      language = "en",
      mode = "new-design",
      currentDesign = null,
    } = req.body;

    const allowedLanguages = ["sr-latn", "sr-cyrl", "en"];

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        message: "Izabrani jezik nije podržan.",
      });
    }

    const allowedGenerationModes = ["language", "new-design"];

    if (!allowedGenerationModes.includes(mode)) {
      return res.status(400).json({
        message: "Izabrani način generisanja nije podržan.",
      });
    }

    if (mode === "language" && !currentDesign) {
      return res.status(400).json({
        message: "Za promenu jezika je potreban trenutni dizajn CV-a.",
      });
    }

    const languageInstruction =
      language === "sr-latn"
        ? "Generate all editable/descriptive CV text in Serbian using Latin script."
        : language === "sr-cyrl"
          ? "Generate all editable/descriptive CV text in Serbian using Cyrillic script."
          : "Generate all editable/descriptive CV text in English.";

    if (!cvId || !data) {
      return res.status(400).json({
        message: "CV ID i podaci CV-a su obavezni.",
      });
    }

    const dataForAI = {
      ...data,

      personalInfo: {
        ...data.personalInfo,
        photo: undefined,
      },
    };

    const hasProfilePhoto = Boolean(data.personalInfo?.photo);

    const existingCV = await pool.query(
      `
        SELECT
          id,
          ai_design
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
    let previousDesign: any =
      currentDesign ?? existingCV.rows[0]?.ai_design ?? null;

    if (typeof previousDesign === "string") {
      try {
        previousDesign = JSON.parse(previousDesign);
      } catch {
        previousDesign = null;
      }
    }

    const pickRandom = <T>(items: T[]): T => {
      return items[Math.floor(Math.random() * items.length)];
    };

    const layoutOptions = ["single-column", "two-column", "sidebar"];

    const targetLayout = previousDesign?.layout
      ? pickRandom(
          layoutOptions.filter((layout) => layout !== previousDesign.layout),
        )
      : pickRandom(layoutOptions);

    const fontOptions = ["Inter", "Roboto", "Poppins", "Georgia"];

    const targetFont = previousDesign?.font
      ? pickRandom(fontOptions.filter((font) => font !== previousDesign.font))
      : pickRandom(fontOptions);

    const headingStyleOptions = ["line", "accent", "minimal"];

    const targetHeadingStyle = previousDesign?.headingStyle
      ? pickRandom(
          headingStyleOptions.filter(
            (style) => style !== previousDesign.headingStyle,
          ),
        )
      : pickRandom(headingStyleOptions);

    const skillsStyleOptions = ["list", "badges", "bars"];

    const targetSkillsStyle = previousDesign?.skillsStyle
      ? pickRandom(
          skillsStyleOptions.filter(
            (style) => style !== previousDesign.skillsStyle,
          ),
        )
      : pickRandom(skillsStyleOptions);

    const experienceStyleOptions = ["standard", "timeline", "compact"];

    const targetExperienceStyle = previousDesign?.experienceStyle
      ? pickRandom(
          experienceStyleOptions.filter(
            (style) => style !== previousDesign.experienceStyle,
          ),
        )
      : pickRandom(experienceStyleOptions);

    const designDirections = [
      "clean editorial",
      "modern technical",
      "minimal elegant",
      "bold professional",
      "balanced contemporary",
      "creative but restrained",
      "structured corporate",
      "refined academic",
    ];

    const designDirection = pickRandom(designDirections);
    const ai = new GoogleGenAI({
      apiKey,
    });
    const designModeInstruction =
      mode === "language"
        ? `
=====================================================
DESIGN MODE: KEEP CURRENT DESIGN
=====================================================

The user wants to generate/change the CV language only.

Preserve the current visual design exactly.

Current design:
${JSON.stringify(currentDesign, null, 2)}

Do not intentionally redesign anything.
Do not change layout, sidebar position, sidebar width, colors, font,
photo position, photo shape, photo size, header alignment, header style,
mainSections, sideSections, headingStyle, skillsStyle, experienceStyle,
or spacing.

The response schema still requires a design object.
Return the same current design values.
`
        : `
=====================================================
DESIGN MODE: CREATE A NEW DESIGN
=====================================================

Create a clearly different professional visual design.

Design direction for THIS generation:
"${designDirection}"

Target layout for THIS generation:
"${targetLayout}"

Target font for THIS generation:
"${targetFont}"

Target heading style for THIS generation:
"${targetHeadingStyle}"

Target skills style for THIS generation:
"${targetSkillsStyle}"

Target experience style for THIS generation:
"${targetExperienceStyle}"

Current/previous design:
${previousDesign ? JSON.stringify(previousDesign, null, 2) : "NONE - this is the first AI design"}

- Create a clearly different professional composition.
- Do not reuse the previous overall layout when another suitable layout exists.
- Do not reuse the same font when another suitable font exists.
- Do not reuse the same heading style.
- Do not reuse the same skills presentation.
- Do not reuse the same experience presentation.
- Choose noticeably different professional primary and accent colors.
- If both layouts use a sidebar, prefer the opposite sidebar side.
- Change photo placement or treatment when appropriate.
- Redistribute supporting sections when it improves the composition.
- The result must feel genuinely different, not like a recolored copy.

There are NO fixed templates.
Design dynamically using the available renderer options.
`;

    const prompt = `
You are an expert CV writer and professional resume designer.

Your task has TWO equally important parts:

1. Improve the candidate's CV wording.
2. Design a professional CV layout specifically for this candidate.

The frontend has a flexible renderer and will build the CV based on the
design configuration you return.

=====================================================
LANGUAGE
=====================================================

${languageInstruction}

- Apply the selected language consistently to descriptive CV content.
- Translate natural-language descriptions where appropriate.
- Do NOT translate or alter proper names, company names, school names, URLs, email addresses, technology names, programming languages, framework names, or project names unless the source itself already uses a localized form.
- Keep factual meaning unchanged.

=====================================================
CONTENT RULES
=====================================================

- Never invent companies.
- Never invent jobs.
- Never invent education.
- Never invent technologies.
- Never invent certificates.
- Never invent projects.
- Never invent achievements.
- Never invent dates.
- Never invent contact information.
- Never invent qualifications.

Keep all factual information exactly consistent with the original CV.

You MAY:
- improve wording
- improve grammar
- improve professional tone
- improve descriptions
- make descriptions clearer and more concise

If a field is empty, keep it empty.

Do not create content for an empty field.

${designModeInstruction}

=====================================================
DESIGN GOAL
=====================================================

Create a visually professional CV layout.

Do NOT simply change colors.

You must actively choose the visual structure of the CV based on the
candidate's profile and available content.

You can decide:

- whether the CV should use one column
- whether it should use two columns
- whether it should have a sidebar
- whether the sidebar should be left or right
- sidebar width
- which sections belong in the sidebar
- which sections belong in the main content
- section order
- header alignment
- header visual style
- photo placement
- photo shape
- photo size
- font
- primary color
- accent color
- heading style
- skills presentation
- experience presentation
- overall spacing

=====================================================
AVAILABLE LAYOUTS
=====================================================

layout:

- single-column
- two-column
- sidebar

Use single-column when a clean traditional CV is best.

Use two-column when separating supporting information from main
professional content improves readability.

Use sidebar when a strong modern professional layout is appropriate.

=====================================================
SIDEBAR
=====================================================

sidebarPosition:

- left
- right

sidebarWidth:

Choose a number between 24 and 40.

Recommended values are usually between 28 and 34.

=====================================================
COLORS
=====================================================

Return primaryColor and accentColor as valid six-digit HEX colors.

Example:

#1f2937
#4f46e5

primaryColor is the main structural color.

accentColor is used for visual emphasis.

Colors must remain professional and readable.

Avoid extremely bright or childish combinations.

=====================================================
FONTS
=====================================================

Choose exactly one:

- Inter
- Roboto
- Poppins
- Georgia

=====================================================
PROFILE PHOTO
=====================================================

The candidate currently has a profile photo:

${hasProfilePhoto ? "YES" : "NO"}

photo.visible:

Set true only if the candidate actually has a profile photo.

If the candidate does not have a photo, photo.visible MUST be false.

photo.position:

- header
- sidebar

photo.shape:

- circle
- rounded
- square

photo.size:

- small
- medium
- large

Choose photo placement that matches the chosen layout.

For sidebar layouts, a sidebar photo is often appropriate.

For single-column layouts, a header photo is usually more appropriate.

=====================================================
HEADER
=====================================================

header.alignment:

- left
- center

header.style:

- minimal
- bold
- accent

Choose a header style that matches the candidate and the overall design.

=====================================================
AVAILABLE SECTIONS
=====================================================

- contact
- experience
- education
- skills
- languages
- projects
- certificates

mainSections contains sections rendered in the main content area.

sideSections contains sections rendered in the secondary column or sidebar.

Every available section must appear exactly once across mainSections
and sideSections.

Do not duplicate sections.

Do not invent section names.

For a single-column layout, sideSections should normally be empty and
all sections should be inside mainSections.

For sidebar and two-column layouts, place supporting information such as:

- contact
- skills
- languages
- sometimes education

in sideSections when appropriate.

Experience and projects generally belong in the main area.

However, choose the arrangement that best represents THIS candidate.

=====================================================
CANDIDATE-SPECIFIC DESIGN
=====================================================

Analyze the actual CV before selecting the layout.

Examples:

Students and junior software developers:
- emphasize projects
- emphasize skills
- emphasize education
- do not create fake professional experience

Experienced professionals:
- emphasize professional experience
- keep supporting information secondary

Technical candidates:
- clean modern layouts are usually appropriate
- projects and skills may deserve prominent placement

Traditional professions:
- conservative single-column or structured two-column designs may be
  more appropriate

Creative candidates:
- stronger visual hierarchy can be used while remaining professional

Do not use the same layout mechanically for every candidate.

=====================================================
SECTION STYLES
=====================================================

headingStyle:

- line
- accent
- minimal

skillsStyle:

- list
- badges
- bars

experienceStyle:

- standard
- timeline
- compact

spacing:

- compact
- normal
- spacious

=====================================================
IMPORTANT
=====================================================

The design must be suitable for an A4 CV.

Avoid layouts that waste excessive space.

Prioritize readability.

Do not remove factual information.

Do not place the same section in both columns.

=====================================================
INPUT CV
=====================================================

${JSON.stringify(dataForAI, null, 2)}

=====================================================
OUTPUT
=====================================================

Return ONLY valid JSON.

Do not use markdown.
Do not use code blocks.
Do not include explanations.
Do not include text before or after the JSON.

Return exactly this structure:

{
  "data": {
    "personalInfo": {
      "firstName": "",
      "lastName": "",
      "email": "",
      "phone": "",
      "address": "",
      "linkedIn": "",
      "github": "",
      "portfolio": ""
    },
    "education": [],
    "experience": [],
    "skills": [],
    "languages": [],
    "projects": [],
    "certificates": [],
    "template": "modern"
  },

  "design": {
    "layout": "sidebar",

    "sidebarPosition": "left",

    "sidebarWidth": 30,

    "primaryColor": "#1f2937",

    "accentColor": "#4f46e5",

    "font": "Inter",

    "photo": {
      "visible": true,
      "position": "sidebar",
      "shape": "circle",
      "size": "large"
    },

    "header": {
      "alignment": "left",
      "style": "bold"
    },

    "mainSections": [
      "experience",
      "projects",
      "education",
      "certificates"
    ],

    "sideSections": [
      "contact",
      "skills",
      "languages"
    ],

    "headingStyle": "accent",

    "skillsStyle": "list",

    "experienceStyle": "timeline",

    "spacing": "normal"
  }
}
`;
    const response = await generateWithRetry(ai, prompt);

    if (!response.text) {
      return res.status(500).json({
        message: "Gemini nije vratio generisani CV.",
      });
    }

    console.log("Gemini raw response:", response.text);
    const cleanedText = response.text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let generatedData: any;
    let generatedDesign: any;
    try {
      const parsedResult = JSON.parse(cleanedText);

      generatedData = parsedResult.data;

      generatedDesign = parsedResult.design;
    } catch (parseError) {
      console.error("Greška prilikom parsiranja Gemini odgovora:", parseError);

      console.error("Gemini odgovor:", response.text);

      return res.status(500).json({
        message: "AI je vratio neispravan format podataka.",
      });
    }
    if (!generatedData) {
      return res.status(500).json({
        message: "AI nije vratio generisane CV podatke.",
      });
    }

    if (!generatedDesign) {
      return res.status(500).json({
        message: "AI nije vratio podatke o dizajnu.",
      });
    }
    if (mode === "language") {
      generatedDesign = JSON.parse(JSON.stringify(currentDesign));
    }
    if (
      Array.isArray(generatedData.education) &&
      Array.isArray(data.education)
    ) {
      generatedData.education = generatedData.education.map(
        (education: any, index: number) => ({
          ...education,

          id: data.education[index]?.id ?? Date.now() + index,
        }),
      );
    }

    if (
      Array.isArray(generatedData.experience) &&
      Array.isArray(data.experience)
    ) {
      generatedData.experience = generatedData.experience.map(
        (experience: any, index: number) => ({
          ...experience,

          id: data.experience[index]?.id ?? Date.now() + 1000 + index,
        }),
      );
    }

    if (
      Array.isArray(generatedData.languages) &&
      Array.isArray(data.languages)
    ) {
      generatedData.languages = generatedData.languages.map(
        (language: any, index: number) => ({
          ...language,

          id: data.languages[index]?.id ?? Date.now() + 2000 + index,
        }),
      );
    }

    if (Array.isArray(generatedData.projects) && Array.isArray(data.projects)) {
      generatedData.projects = generatedData.projects.map(
        (project: any, index: number) => ({
          ...project,

          id: data.projects[index]?.id ?? Date.now() + 3000 + index,
        }),
      );
    }

    if (
      Array.isArray(generatedData.certificates) &&
      Array.isArray(data.certificates)
    ) {
      generatedData.certificates = generatedData.certificates.map(
        (certificate: any, index: number) => ({
          ...certificate,

          id: data.certificates[index]?.id ?? Date.now() + 4000 + index,
        }),
      );
    }

    const allowedLayouts = ["single-column", "two-column", "sidebar"];
    const allowedSidebarPositions = ["left", "right"];
    const allowedFonts = ["Inter", "Roboto", "Poppins", "Georgia"];
    const allowedPhotoPositions = ["header", "sidebar"];
    const allowedPhotoShapes = ["circle", "rounded", "square"];
    const allowedPhotoSizes = ["small", "medium", "large"];
    const allowedHeaderAlignments = ["left", "center"];
    const allowedHeaderStyles = ["minimal", "bold", "accent"];
    const allowedHeadingStyles = ["line", "accent", "minimal"];
    const allowedSkillsStyles = ["list", "badges", "bars"];
    const allowedExperienceStyles = ["standard", "timeline", "compact"];
    const allowedSpacing = ["compact", "normal", "spacious"];
    const allowedSections = [
      "contact",
      "experience",
      "education",
      "skills",
      "languages",
      "projects",
      "certificates",
    ];

    if (!allowedLayouts.includes(generatedDesign.layout)) {
      generatedDesign.layout = "single-column";
    }

    if (!allowedSidebarPositions.includes(generatedDesign.sidebarPosition)) {
      generatedDesign.sidebarPosition = "left";
    }

    if (
      typeof generatedDesign.sidebarWidth !== "number" ||
      Number.isNaN(generatedDesign.sidebarWidth)
    ) {
      generatedDesign.sidebarWidth = 30;
    }

    generatedDesign.sidebarWidth = Math.min(
      40,
      Math.max(24, generatedDesign.sidebarWidth),
    );
    if (
      typeof generatedDesign.primaryColor !== "string" ||
      !/^#[0-9A-Fa-f]{6}$/.test(generatedDesign.primaryColor)
    ) {
      generatedDesign.primaryColor = "#1f2937";
    }

    if (
      typeof generatedDesign.accentColor !== "string" ||
      !/^#[0-9A-Fa-f]{6}$/.test(generatedDesign.accentColor)
    ) {
      generatedDesign.accentColor = "#4f46e5";
    }
    if (!allowedFonts.includes(generatedDesign.font)) {
      generatedDesign.font = "Inter";
    }
    if (!generatedDesign.photo) {
      generatedDesign.photo = {};
    }

    generatedDesign.photo.visible =
      Boolean(data.personalInfo?.photo) &&
      generatedDesign.photo.visible === true;

    if (!allowedPhotoPositions.includes(generatedDesign.photo.position)) {
      generatedDesign.photo.position =
        generatedDesign.layout === "sidebar" ? "sidebar" : "header";
    }

    if (!allowedPhotoShapes.includes(generatedDesign.photo.shape)) {
      generatedDesign.photo.shape = "circle";
    }

    if (!allowedPhotoSizes.includes(generatedDesign.photo.size)) {
      generatedDesign.photo.size = "medium";
    }

    if (!generatedDesign.header) {
      generatedDesign.header = {};
    }

    if (!allowedHeaderAlignments.includes(generatedDesign.header.alignment)) {
      generatedDesign.header.alignment = "left";
    }

    if (!allowedHeaderStyles.includes(generatedDesign.header.style)) {
      generatedDesign.header.style = "minimal";
    }
    if (!allowedHeadingStyles.includes(generatedDesign.headingStyle)) {
      generatedDesign.headingStyle = "line";
    }

    if (!allowedSkillsStyles.includes(generatedDesign.skillsStyle)) {
      generatedDesign.skillsStyle = "badges";
    }

    if (!allowedExperienceStyles.includes(generatedDesign.experienceStyle)) {
      generatedDesign.experienceStyle = "standard";
    }

    if (!allowedSpacing.includes(generatedDesign.spacing)) {
      generatedDesign.spacing = "normal";
    }
    const cleanSections = (sections: unknown) => {
      if (!Array.isArray(sections)) {
        return [];
      }

      return [
        ...new Set(
          sections.filter(
            (section): section is string =>
              typeof section === "string" && allowedSections.includes(section),
          ),
        ),
      ];
    };

    let mainSections = cleanSections(generatedDesign.mainSections);
    let sideSections = cleanSections(generatedDesign.sideSections);

    sideSections = sideSections.filter(
      (section) => !mainSections.includes(section),
    );

    for (const section of allowedSections) {
      if (!mainSections.includes(section) && !sideSections.includes(section)) {
        mainSections.push(section);
      }
    }
    if (generatedDesign.layout === "single-column") {
      mainSections = [
        ...mainSections,
        ...sideSections.filter((section) => !mainSections.includes(section)),
      ];

      sideSections = [];
    }

    generatedDesign.mainSections = mainSections;
    generatedDesign.sideSections = sideSections;
    generatedData.template = data.template || "modern";
    console.log("GENERATED CV DATA:", generatedData);
    console.log("GENERATED CV DESIGN:", generatedDesign);

    return res.status(200).json({
      message: "CV je uspešno generisan pomoću AI-a.",

      cvId,
      language,
      mode,

      data: generatedData,

      design: generatedDesign,
    });
  } catch (error: any) {
    console.error("GENERATE CV ERROR:", error);

    /*
     * Gemini 503 =
     * servis je trenutno preopterećen.
     */
    if (error?.status === 503) {
      return res.status(503).json({
        message:
          "AI servis je trenutno preopterećen. Pokušajte ponovo za nekoliko trenutaka.",
      });
    }

    if (error?.status === 429) {
      return res.status(429).json({
        message:
          "Dostignut je trenutni limit AI servisa. Pokušajte ponovo kasnije.",
      });
    }

    return res.status(500).json({
      message: "Greška prilikom generisanja CV-a.",

      error: error instanceof Error ? error.message : String(error),
    });
  }
};
