import { useEffect, useState } from "react";

import { postRequest } from "../api/ApiFunctions";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import ExperienceForm from "../components/cv/ExperienceForm";
import SkillsForm from "../components/cv/SkillsForm";
import LanguagesForm from "../components/cv/LanguagesForm";
import ProjectsForm from "../components/cv/ProjectsForm";
import CertificatesForm from "../components/cv/CertificatesForm";
import PersonalInfoForm from "../components/cv/PersonalInfo";
import EducationForm from "../components/cv/EducationForm";
import CVPreview from "../components/cv/CVPreview";
import CVTemplateSelector from "../components/cv/CVTemplateSelector";

import { defaultCVDesign } from "../types/cv";

import type { CVData, CVDesignConfig } from "../types/cv";

const defaultCVData: CVData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    photo: "",
  },

  education: [],
  experience: [],
  skills: [],
  languages: [],
  projects: [],
  certificates: [],

  template: "modern",
};

const CVBuilder = () => {
  /*
   * =====================================================
   * CV DATA
   * =====================================================
   */

  const [cvData, setCvData] = useState<CVData>(defaultCVData);

  const [currentCVId, setCurrentCVId] = useState<number | null>(null);

  const [generatedCVData, setGeneratedCVData] = useState<CVData | null>(null);

  /*
   * =====================================================
   * AI
   * =====================================================
   */

  const [generating, setGenerating] = useState(false);

  const [generateError, setGenerateError] = useState("");

  const [generationLanguage, setGenerationLanguage] = useState<
    "sr-latn" | "sr-cyrl" | "en"
  >("en");

  const [activeGenerationMode, setActiveGenerationMode] = useState<
    "language" | "new-design" | null
  >(null);

  /*
   * =====================================================
   * SAVE AI VERSION
   * =====================================================
   */

  const [savingAI, setSavingAI] = useState(false);

  const [saveAIMessage, setSaveAIMessage] = useState("");

  const [saveAIError, setSaveAIError] = useState("");

  /*
   * =====================================================
   * DESIGN
   * =====================================================
   */

  const [designConfig, setDesignConfig] =
    useState<CVDesignConfig>(defaultCVDesign);

  const [isAIDesigned, setIsAIDesigned] = useState(false);

  /*
   * =====================================================
   * LOAD CV FROM HISTORY
   * =====================================================
   */

  useEffect(() => {
    const selectedCV = localStorage.getItem("selectedCV");

    if (!selectedCV) {
      return;
    }

    try {
      const parsedCV = JSON.parse(selectedCV);

      /*
       * =================================================
       * AI CV IZ HISTORY-JA
       * =================================================
       */

      if (
        parsedCV.isAIGenerated === true &&
        parsedCV.aiDesign &&
        parsedCV.data
      ) {
        const aiData: CVData = {
          ...parsedCV.data,

          personalInfo: {
            ...parsedCV.data.personalInfo,

            photo:
              parsedCV.data.personalInfo?.photo ||
              parsedCV.originalData?.personalInfo?.photo ||
              "",
          },
        };

        /*
         * Originalni CV držimo u formama.
         *
         * Ako originalData ne postoji,
         * koristimo AI podatke kao fallback.
         */
        const originalData: CVData = parsedCV.originalData
          ? {
              ...parsedCV.originalData,

              personalInfo: {
                ...parsedCV.originalData.personalInfo,

                photo:
                  parsedCV.originalData.personalInfo?.photo ||
                  aiData.personalInfo.photo ||
                  "",
              },
            }
          : aiData;

        setCvData(originalData);

        /*
         * OVO JE AI VERZIJA KOJU
         * CVPreview PRIKAZUJE.
         */
        setGeneratedCVData(aiData);

        /*
         * NAJVAŽNIJE:
         *
         * ne vraćamo default design,
         * nego design koji smo sačuvali
         * zajedno sa AI CV-em.
         */
        setDesignConfig({
          ...defaultCVDesign,
          ...parsedCV.aiDesign,

          photo: {
            ...defaultCVDesign.photo,
            ...(parsedCV.aiDesign.photo ?? {}),
          },

          header: {
            ...defaultCVDesign.header,
            ...(parsedCV.aiDesign.header ?? {}),
          },

          mainSections: parsedCV.aiDesign.mainSections?.length
            ? parsedCV.aiDesign.mainSections
            : defaultCVDesign.mainSections,

          sideSections:
            parsedCV.aiDesign.sideSections ?? defaultCVDesign.sideSections,
        });

        setCurrentCVId(parsedCV.id);

        if (
          parsedCV.language === "sr-latn" ||
          parsedCV.language === "sr-cyrl" ||
          parsedCV.language === "en"
        ) {
          setGenerationLanguage(parsedCV.language);
        }

        setIsAIDesigned(true);

        setGenerateError("");
        setSaveAIMessage("");
        setSaveAIError("");

        localStorage.removeItem("selectedCV");

        return;
      }

      /*
       * =================================================
       * OBIČAN CV IZ HISTORY-JA
       * =================================================
       */

      const loadedCV: CVData = parsedCV.data;

      const normalizedCV: CVData = {
        ...loadedCV,

        personalInfo: {
          ...loadedCV.personalInfo,

          photo: loadedCV.personalInfo?.photo || "",
        },
      };

      setCvData(normalizedCV);

      setCurrentCVId(parsedCV.id);

      if (
        parsedCV.language === "sr-latn" ||
        parsedCV.language === "sr-cyrl" ||
        parsedCV.language === "en"
      ) {
        setGenerationLanguage(parsedCV.language);
      }

      setGeneratedCVData(null);

      setDesignConfig({
        ...defaultCVDesign,
      });

      setIsAIDesigned(false);

      localStorage.removeItem("selectedCV");
    } catch (error) {
      console.error("Failed to load selected CV:", error);
    }
  }, []);

  /*
   * =====================================================
   * GENERATE WITH AI
   * =====================================================
   */

  const generateCVWithAI = async (mode: "language" | "new-design") => {
    try {
      setGenerateError("");

      setSaveAIMessage("");
      setSaveAIError("");

      if (!currentCVId) {
        setGenerateError(
          "Prvo sačuvaj CV pre nego što ga generišeš pomoću AI-a.",
        );

        return;
      }

      setGenerating(true);
      setActiveGenerationMode(mode);

      const response = await postRequest<
        {
          data: CVData;
          design: CVDesignConfig;
          mode: "language" | "new-design";
        },
        {
          cvId: number;
          data: CVData;
          language: "sr-latn" | "sr-cyrl" | "en";
          mode: "language" | "new-design";
          currentDesign: CVDesignConfig;
        }
      >("/cvs/generate", {
        cvId: currentCVId,
        data: cvData,
        language: generationLanguage,
        mode,
        currentDesign: designConfig,
      });

      /*
       * Fotografiju nikada ne prepuštamo Gemini-ju.
       */
      const generatedData: CVData = {
        ...response.data,

        personalInfo: {
          ...response.data.personalInfo,

          photo: cvData.personalInfo.photo || "",
        },
      };

      setGeneratedCVData(generatedData);

      /*
       * Backend garantuje:
       *
       * language   -> potpuno isti designConfig
       * new-design -> nov AI designConfig
       */
      setDesignConfig({
        ...defaultCVDesign,
        ...response.design,

        photo: {
          ...defaultCVDesign.photo,
          ...(response.design.photo ?? {}),
        },

        header: {
          ...defaultCVDesign.header,
          ...(response.design.header ?? {}),
        },

        mainSections: response.design.mainSections?.length
          ? response.design.mainSections
          : defaultCVDesign.mainSections,

        sideSections:
          response.design.sideSections ?? defaultCVDesign.sideSections,
      });

      setIsAIDesigned(true);
    } catch (error) {
      console.error("Generate CV error:", error);

      if (error instanceof Error) {
        setGenerateError(error.message);
      } else {
        setGenerateError("Greška prilikom generisanja CV-a.");
      }
    } finally {
      setGenerating(false);
      setActiveGenerationMode(null);
    }
  };

  /*
   * =====================================================
   * SAVE AI CV
   * =====================================================
   */

  const saveCurrentAICV = async () => {
    if (!currentCVId) {
      setSaveAIError("CV prvo mora biti sačuvan.");

      return;
    }

    if (!generatedCVData) {
      setSaveAIError("Prvo generiši AI CV.");

      return;
    }

    try {
      setSavingAI(true);

      setSaveAIMessage("");
      setSaveAIError("");

      /*
       * Ovde šaljemo TAČNO:
       *
       * - ono što preview prikazuje
       * - fotografiju
       * - sve boje
       * - layout
       * - sidebar
       * - font
       * - section order
       * - photo poziciju
       * - header style
       */
      const response = await postRequest<
        {
          message: string;
          cvId: number;
          sourceCvId: number;
          language: "sr-latn" | "sr-cyrl" | "en";
          data: CVData;
          design: CVDesignConfig;
          createdAt: string;
          updatedAt: string;
        },
        {
          data: CVData;
          design: CVDesignConfig;
          language: "sr-latn" | "sr-cyrl" | "en";
        }
      >(`/cvs/${currentCVId}/ai-version`, {
        data: generatedCVData,
        design: designConfig,
        language: generationLanguage,
      });

      setSaveAIMessage(`${response.message} Novi CV ID: ${response.cvId}.`);
    } catch (error) {
      console.error("Save AI CV error:", error);

      if (error instanceof Error) {
        setSaveAIError(error.message);
      } else {
        setSaveAIError("Greška prilikom čuvanja AI CV-a.");
      }
    } finally {
      setSavingAI(false);
    }
  };

  /*
   * =====================================================
   * SHOW ORIGINAL
   * =====================================================
   */

  const showOriginalCV = () => {
    setGeneratedCVData(null);

    setDesignConfig({
      ...defaultCVDesign,
    });

    setIsAIDesigned(false);

    setGenerateError("");

    setSaveAIMessage("");
    setSaveAIError("");
  };

  /*
   * =====================================================
   * TEMPLATE
   * =====================================================
   */

  const handleTemplateChange = (template: CVData["template"]) => {
    setCvData((previous) => ({
      ...previous,
      template,
    }));

    /*
     * Manualni template ne treba
     * da uništi AI podatke.
     */
    setGeneratedCVData((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,

        template,

        personalInfo: {
          ...previous.personalInfo,

          photo: cvData.personalInfo.photo || previous.personalInfo.photo || "",
        },
      };
    });
  };

  /*
   * =====================================================
   * PERSONAL INFO
   * =====================================================
   */

  const handlePersonalInfoChange = (personalInfo: CVData["personalInfo"]) => {
    setCvData((previous) => ({
      ...previous,
      personalInfo,
    }));

    /*
     * Ako je otvoren AI CV,
     * menjamo fotografiju i u
     * trenutnom AI preview-u.
     */
    setGeneratedCVData((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,

        personalInfo: {
          ...previous.personalInfo,

          photo: personalInfo.photo || "",
        },
      };
    });

    /*
     * Ako korisnik promeni fotografiju,
     * prethodna Saved poruka više nije
     * relevantna.
     */
    setSaveAIMessage("");
  };

  /*
   * =====================================================
   * CURRENT PREVIEW DATA
   * =====================================================
   */

  const previewData = generatedCVData ?? cvData;

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {/* PAGE HEADER */}

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">CV Generator</h1>

            <p className="mt-2 text-slate-500">
              Kreiraj profesionalni CV i unapredi sadržaj i dizajn pomoću AI-a.
            </p>
          </div>

          {/* FORMS */}

          <div className="grid gap-8 xl:grid-cols-2">
            <CVTemplateSelector
              template={cvData.template}
              setTemplate={handleTemplateChange}
            />

            <PersonalInfoForm
              data={cvData.personalInfo}
              setData={handlePersonalInfoChange}
            />

            <EducationForm
              data={cvData.education}
              setData={(education) =>
                setCvData((previous) => ({
                  ...previous,
                  education,
                }))
              }
            />

            <ExperienceForm
              data={cvData.experience}
              setData={(experience) =>
                setCvData((previous) => ({
                  ...previous,
                  experience,
                }))
              }
            />

            <SkillsForm
              data={cvData.skills}
              setData={(skills) =>
                setCvData((previous) => ({
                  ...previous,
                  skills,
                }))
              }
            />

            <LanguagesForm
              data={cvData.languages}
              setData={(languages) =>
                setCvData((previous) => ({
                  ...previous,
                  languages,
                }))
              }
            />

            <ProjectsForm
              data={cvData.projects}
              setData={(projects) =>
                setCvData((previous) => ({
                  ...previous,
                  projects,
                }))
              }
            />

            <CertificatesForm
              data={cvData.certificates}
              setData={(certificates) =>
                setCvData((previous) => ({
                  ...previous,
                  certificates,
                }))
              }
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-slate-800">
                  AI CV Asistent
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Promena jezika zadržava postojeći dizajn. Novi AI dizajn pravi
                  drugačiji vizuelni raspored, boje i stil.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Jezik CV-ja
                  </label>

                  <select
                    value={generationLanguage}
                    onChange={(e) =>
                      setGenerationLanguage(
                        e.target.value as "sr-latn" | "sr-cyrl" | "en",
                      )
                    }
                    disabled={generating}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="en">English</option>
                    <option value="sr-latn">Srpski (latinica)</option>
                    <option value="sr-cyrl">Srpski (ćirilica)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => generateCVWithAI("language")}
                  disabled={generating}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating && activeGenerationMode === "language"
                    ? "Generisanje..."
                    : "Generiši na izabranom jeziku"}
                </button>

                <button
                  type="button"
                  onClick={() => generateCVWithAI("new-design")}
                  disabled={generating}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating && activeGenerationMode === "new-design"
                    ? "Kreiranje dizajna..."
                    : "Generiši novi dizajn"}
                </button>

                {generatedCVData && (
                  <>
                    <button
                      type="button"
                      onClick={saveCurrentAICV}
                      disabled={savingAI}
                      className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingAI ? "Čuvanje..." : " Sačuvaj kao novi CV"}
                    </button>

                    <button
                      type="button"
                      onClick={showOriginalCV}
                      className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Prikaži originalan
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ERRORS */}

          {generateError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {generateError}
            </p>
          )}

          {saveAIError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {saveAIError}
            </p>
          )}

          {/* SUCCESS */}

          {saveAIMessage && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {saveAIMessage}
            </p>
          )}

          {generatedCVData && isAIDesigned && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              AI CV je spreman. Čuvanje će napraviti novu stavku u istoriji.
            </p>
          )}

          {/* DESIGN INFO */}

          {/* PREVIEW */}

          <div className="mt-8">
            <CVPreview
              data={previewData}
              cvId={currentCVId}
              onSave={setCurrentCVId}
              isAIGenerated={generatedCVData !== null}
              design={designConfig}
              language={generationLanguage}
            />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default CVBuilder;
