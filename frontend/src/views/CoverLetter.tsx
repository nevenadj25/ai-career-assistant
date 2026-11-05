import { useEffect, useRef, useState } from "react";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { getCVs } from "../api/cvApi";
import { postRequest } from "../api/ApiFunctions";

import type { StoredCV } from "../api/cvApi";

const CoverLetter = () => {
  const [cvs, setCvs] = useState<StoredCV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [cvError, setCvError] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState<"sr-latn" | "sr-cyrl" | "en">("en");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCVs = async () => {
      try {
        setLoadingCVs(true);
        setCvError("");

        const response = await getCVs();

        setCvs(response);
      } catch (error) {
        console.error("Greška prilikom učitavanja CV-jeva:", error);

        setCvError("Nije moguće učitati sačuvane CV-jeve.");
      } finally {
        setLoadingCVs(false);
      }
    };

    loadCVs();
  }, []);

  const selectedCV = cvs.find((cv) => cv.id === selectedCVId) ?? null;

  const fullName = selectedCV
    ? `${selectedCV.data.personalInfo.firstName} ${selectedCV.data.personalInfo.lastName}`.trim()
    : "";

  const handleGenerate = async () => {
    setGenerateError("");
    setSaveMessage("");
    setSaveError("");
    setCopied(false);

    if (!selectedCVId) {
      setGenerateError("Izaberi CV koji želiš da koristiš.");
      return;
    }

    if (!position.trim()) {
      setGenerateError("Unesi poziciju za koju konkurišeš.");
      return;
    }

    if (!company.trim()) {
      setGenerateError("Unesi naziv kompanije.");
      return;
    }

    if (!jobDescription.trim()) {
      setGenerateError("Unesi opis oglasa za posao.");
      return;
    }

    try {
      setGenerating(true);

      const response = await postRequest<
        {
          letter: string;
        },
        {
          cvId: number;
          position: string;
          company: string;
          jobDescription: string;
          language: "sr-latn" | "sr-cyrl" | "en";
        }
      >("/cover-letters/generate", {
        cvId: selectedCVId,
        position,
        company,
        jobDescription,
        language,
      });

      setGeneratedLetter(response.letter);
    } catch (error) {
      console.error("Cover letter generation error:", error);

      if (error instanceof Error) {
        setGenerateError(error.message);
      } else {
        setGenerateError("Greška prilikom generisanja motivacionog pisma.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedLetter);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter.trim()) {
      return;
    }

    if (!selectedCVId) {
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      setSaveError("");

      const response = await postRequest<
        {
          message: string;
        },
        {
          cvId: number;
          fullName: string;
          position: string;
          company: string;
          jobDescription: string;
          content: string;
        }
      >("/cover-letters", {
        cvId: selectedCVId,
        fullName,
        position,
        company,
        jobDescription,
        content: generatedLetter,
      });

      setSaveMessage(response.message);
    } catch (error) {
      console.error("Greška prilikom čuvanja:", error);

      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Greška prilikom čuvanja motivacionog pisma.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedLetter.trim()) {
      return;
    }

    if (!pdfContentRef.current) {
      return;
    }

    try {
      setDownloading(true);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const element = pdfContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;
      const pageHeightInCanvasPixels =
        (printableHeight * canvas.width) / printableWidth;

      let sourceY = 0;
      let pageNumber = 0;

      while (sourceY < canvas.height) {
        const remainingHeight = canvas.height - sourceY;
        const sliceHeight = Math.min(pageHeightInCanvasPixels, remainingHeight);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) {
          throw new Error("Nije moguće kreirati PDF canvas.");
        }

        context.fillStyle = "#ffffff";

        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        const pageImage = pageCanvas.toDataURL("image/png");
        const renderedHeight = (sliceHeight * printableWidth) / canvas.width;

        if (pageNumber > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          pageImage,
          "PNG",
          margin,
          margin,
          printableWidth,
          renderedHeight,
        );

        sourceY += sliceHeight;
        pageNumber += 1;
      }

      const safeName =
        fullName
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "") || "Cover_Letter";

      const safeCompany = company
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");

      const fileName = safeCompany
        ? `${safeName}_${safeCompany}_Cover_Letter.pdf`
        : `${safeName}_Cover_Letter.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {/* PAGE HEADER */}

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">
              Motivaciono pismo
            </h1>

            <p className="mt-2 text-gray-600">
              Kreiraj personalizovano motivaciono pismo na osnovu svog CV-a i
              oglasa za posao.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <section className="rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-slate-800">
                Podaci za motivaciono pismo
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Izaberi CV
                  </label>

                  <select
                    value={selectedCVId ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      setSelectedCVId(value ? Number(value) : null);

                      setGeneratedLetter("");
                      setGenerateError("");
                      setSaveMessage("");
                      setSaveError("");
                    }}
                    disabled={loadingCVs}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingCVs
                        ? "Učitavanje CV-jeva..."
                        : "Izaberi sačuvani CV"}
                    </option>

                    {cvs.map((cv) => {
                      const firstName = cv.data.personalInfo.firstName;

                      const lastName = cv.data.personalInfo.lastName;

                      return (
                        <option key={cv.id} value={cv.id}>
                          {firstName} {lastName} — {cv.data.template}
                        </option>
                      );
                    })}
                  </select>

                  {cvError && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {cvError}
                    </p>
                  )}

                  {!loadingCVs && !cvError && cvs.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      Nemaš sačuvan CV. Napravi i sačuvaj CV pre generisanja
                      motivacionog pisma.
                    </p>
                  )}
                </div>
                {selectedCV && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      CV koji će AI koristiti
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {fullName || "Ime nije uneseno"}
                    </p>

                    {selectedCV.data.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedCV.data.skills
                          .slice(0, 6)
                          .map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-600 shadow-sm"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Pozicija
                  </label>

                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Frontend Developer"
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Kompanija
                  </label>

                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Microsoft"
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Opis posla
                  </label>

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={7}
                    placeholder="Nalepi opis oglasa za posao..."
                    className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Jezik motivacionog pisma
                  </label>

                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(
                        e.target.value as "sr-latn" | "sr-cyrl" | "en",
                      );
                      setGeneratedLetter("");
                      setGenerateError("");
                      setSaveMessage("");
                      setSaveError("");
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="en">Engleski</option>
                    <option value="sr-latn">Srpski (latinica)</option>
                    <option value="sr-cyrl">Srpski (ćirilica)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={
                    generating ||
                    !selectedCVId ||
                    !position.trim() ||
                    !company.trim() ||
                    !jobDescription.trim()
                  }
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? "Generating..." : "✨ Generate with AI"}
                </button>

                {generateError && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {generateError}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Prikaz</h2>

                  {generatedLetter && (
                    <p className="mt-1 text-sm text-gray-500">
                      Možeš ručno izmeniti tekst pre čuvanja ili preuzimanja.
                    </p>
                  )}
                </div>

                {generatedLetter && (
                  <div className="flex flex-wrap gap-3">
                    {/* COPY */}

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {copied ? "Kopirano" : "Kopiraj"}
                    </button>

                    {/* DOWNLOAD PDF */}

                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloading ? "Preuzimanje..." : "Preuzmi PDF"}
                    </button>

                    {/* SAVE */}

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Čuva se..." : "Sačuvaj"}
                    </button>
                  </div>
                )}
              </div>

              {!generatedLetter ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <div>
                    <div className="text-5xl"></div>

                    <h3 className="mt-4 text-xl font-bold text-gray-700">
                      Tvoje motivaciono pismo će se ovde pojaviti
                    </h3>

                    <p className="mt-2 text-gray-500">
                      Izaberi CV, unesi podatke o poslu i generiši motivaciono
                      pismo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="min-h-[500px] rounded-xl border border-gray-200 bg-white p-8">
                  {/* INFO */}

                  <div className="mb-6 rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-800">{fullName}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {position} • {company}
                    </p>
                  </div>

                  {/* EDITABLE LETTER */}

                  <textarea
                    value={generatedLetter}
                    onChange={(e) => {
                      setGeneratedLetter(e.target.value);

                      setSaveMessage("");
                      setSaveError("");
                    }}
                    spellCheck
                    className="min-h-[650px] w-full resize-none border-none bg-transparent leading-7 text-gray-700 outline-none"
                  />
                </div>
              )}

              {/* SAVE SUCCESS */}

              {saveMessage && (
                <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  ✓ {saveMessage}
                </p>
              )}

              {/* SAVE ERROR */}

              {saveError && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {saveError}
                </p>
              )}
            </section>
          </div>

          {/* ================================================= */}
          {/* HIDDEN PDF CONTENT */}
          {/* ================================================= */}

          {generatedLetter && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed left-[-10000px] top-0"
            >
              <div
                ref={pdfContentRef}
                style={{
                  width: "794px",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  padding: "70px",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "16px",
                  lineHeight: "1.7",
                }}
              >
                {/*
                 * Ovde NE dodajemo ponovo fullName,
                 * position ili company.
                 *
                 * AI ih već može imati u samom sadržaju
                 * motivacionog pisma.
                 */}

                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                  }}
                >
                  {generatedLetter}
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default CoverLetter;
