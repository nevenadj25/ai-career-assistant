import { useEffect, useRef, useState } from "react";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { getCVs, deleteCV } from "../api/cvApi";

import { getRequest } from "../api/ApiFunctions";

import type { CVData, CVDesignConfig } from "../types/cv";

type HistoryType = "CV" | "Intervju" | "Motivaciono pismo";

interface HistoryItem {
  id: number;
  type: HistoryType;
  title: string;
  date: string;
  description: string;
  hasAIVersion?: boolean;
  language?: "sr-latn" | "sr-cyrl" | "en" | null;
  sourceCvId?: number | null;
}

interface SavedCV {
  id: number;
  userId: number;
  data: CVData;
  createdAt?: string;
  updatedAt?: string;
  language?: "sr-latn" | "sr-cyrl" | "en" | null;
  sourceCvId?: number | null;
  aiContent?: CVData | null;
  aiDesign?: CVDesignConfig | null;
  aiGeneratedAt?: string | null;
}

interface SavedAICVResponse {
  cvId: number;
  data: CVData;
  design: CVDesignConfig;
  generatedAt?: string | null;
}

interface SavedCoverLetter {
  id: number;
  userId: number;
  fullName: string;
  position: string;
  company: string;
  jobDescription: string;
  content: string;
  createdAt: string;
}

const History = () => {
  const [filter, setFilter] = useState<"Sve" | HistoryType>("Sve");
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingCVId, setOpeningCVId] = useState<number | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] =
    useState<SavedCoverLetter | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);

        setError("");
        const [cvsResponse, letters] = await Promise.all([
          getCVs(),

          getRequest<SavedCoverLetter[]>("/cover-letters"),
        ]);

        const cvs = cvsResponse as SavedCV[];

        setSavedCVs(cvs);

        setCoverLetters(letters);
      } catch (error) {
        console.error("Greška prilikom učitavanja istorije:", error);

        setError("Došlo je do greške prilikom učitavanja istorije.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);
  const getCVLanguageLabel = (
    language?: "sr-latn" | "sr-cyrl" | "en" | null,
  ) => {
    switch (language) {
      case "en":
        return "English";

      case "sr-cyrl":
        return "Srpski (ćirilica)";

      case "sr-latn":
        return "Srpski (latinica)";

      default:
        return "Nije navedeno";
    }
  };

  const savedCVHistory: HistoryItem[] = savedCVs.map((cv) => {
    const firstName = cv.data.personalInfo?.firstName || "";

    const lastName = cv.data.personalInfo?.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    let formattedDate = "Saved CV";

    const dateValue = cv.updatedAt || cv.createdAt;

    if (dateValue) {
      const date = new Date(dateValue);

      if (!Number.isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("sr-RS");
      }
    }
    const hasAIVersion =
      Boolean(cv.sourceCvId) || Boolean(cv.aiContent && cv.aiDesign);

    return {
      id: cv.id,

      type: "CV",

      title: fullName || `CV #${cv.id}`,

      date: formattedDate,

      description: hasAIVersion
        ? cv.sourceCvId
          ? `AI verzija kreirana iz CV #${cv.sourceCvId}`
          : "Sačuvana AI verzija"
        : `Template: ${cv.data.template}`,

      hasAIVersion,

      language: cv.language ?? null,

      sourceCvId: cv.sourceCvId ?? null,
    };
  });

  const coverLetterHistory: HistoryItem[] = coverLetters.map((letter) => {
    let formattedDate = "Saved Cover Letter";

    if (letter.createdAt) {
      const date = new Date(letter.createdAt);

      if (!Number.isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("sr-RS");
      }
    }

    return {
      id: letter.id,

      type: "Motivaciono pismo",

      title: letter.position || `Motivaciono pismo #${letter.id}`,

      date: formattedDate,

      description: letter.company
        ? `Company: ${letter.company}`
        : "Motivaciono pismo",
    };
  });

  const historyItems: HistoryItem[] = [
    ...savedCVHistory,
    ...coverLetterHistory,
  ];

  const filteredItems =
    filter === "Sve"
      ? historyItems
      : historyItems.filter((item) => item.type === filter);

  const getIcon = (type: HistoryType) => {
    switch (type) {
      case "CV":
        return "📄";

      case "Intervju":
        return "🎤";

      case "Motivaciono pismo":
        return "✉️";
    }
  };

  const openNormalCV = (cv: SavedCV) => {
    localStorage.setItem(
      "selectedCV",
      JSON.stringify({
        id: cv.id,

        data: cv.data,

        language: cv.language ?? "sr-latn",

        sourceCvId: cv.sourceCvId ?? null,

        isAIGenerated: false,
      }),
    );

    window.location.href = "/cv-builder";
  };
  const handleOpenCV = async (id: number) => {
    const selectedCV = savedCVs.find((cv) => cv.id === id);

    if (!selectedCV) {
      alert("CV nije pronađen.");

      return;
    }
    const isSavedAICV =
      Boolean(selectedCV.sourceCvId) ||
      Boolean(selectedCV.aiContent && selectedCV.aiDesign);

    if (!isSavedAICV) {
      openNormalCV(selectedCV);
      return;
    }

    try {
      setOpeningCVId(id);
      const aiVersion = await getRequest<SavedAICVResponse>(
        `/cvs/${id}/ai-version`,
      );

      localStorage.setItem(
        "selectedCV",
        JSON.stringify({
          id: selectedCV.id,
          originalData: selectedCV.data,
          data: aiVersion.data,
          aiDesign: aiVersion.design,
          language: selectedCV.language ?? "en",
          sourceCvId: selectedCV.sourceCvId ?? null,
          isAIGenerated: true,
        }),
      );

      window.location.href = "/cv-builder";
    } catch (error) {
      console.error("Greška prilikom otvaranja AI CV-ja:", error);
      openNormalCV(selectedCV);
    } finally {
      setOpeningCVId(null);
    }
  };

  const handleDeleteCV = async (id: number) => {
    const confirmed = window.confirm(
      "Da li ste sigurni da želite da obrišete ovaj CV?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCV(id);

      setSavedCVs((currentCVs) => currentCVs.filter((cv) => cv.id !== id));

      alert("CV je uspešno obrisan.");
    } catch (error) {
      console.error("Greška prilikom brisanja CV-a:", error);

      alert("Došlo je do greške prilikom brisanja CV-a.");
    }
  };

  const handleView = (item: HistoryItem) => {
    if (item.type === "Motivaciono pismo") {
      const letter = coverLetters.find(
        (coverLetter) => coverLetter.id === item.id,
      );

      if (!letter) {
        alert("Motivaciono pismo nije pronađeno.");

        return;
      }

      setSelectedCoverLetter(letter);

      setCopied(false);
    }
  };

  const handleCloseCoverLetter = () => {
    setSelectedCoverLetter(null);

    setCopied(false);
  };
  const handleCopyCoverLetter = async () => {
    if (!selectedCoverLetter) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedCoverLetter.content);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  const handleDownloadCoverLetterPDF = async () => {
    if (!selectedCoverLetter) {
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

      const canvas = await html2canvas(pdfContentRef.current, {
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
        selectedCoverLetter.fullName
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "") || "Cover_Letter";

      const safeCompany = selectedCoverLetter.company
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

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {/* HEADER */}

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">Istorija</h1>

            <p className="mt-2 text-gray-600">
              Prikaz tvojih prethodnih CV-jeva, motivacionih pisama i intervjua.
            </p>
          </div>
          <div className="mb-8 flex flex-wrap gap-3">
            {(["Sve", "CV", "Intervju", "Motivaciono pismo"] as const).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-5 py-2.5 font-medium transition ${
                    filter === item
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
              <p className="text-gray-500">Učitavanje istorije...</p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 p-6 text-center shadow-lg">
              <p className="font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* HISTORY */}

          {!loading && !error && (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl md:flex-row md:items-center"
                >
                  {/* ICON */}

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                    {getIcon(item.type)}
                  </div>

                  {/* INFORMATION */}

                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-800">
                        {item.title}
                      </h2>

                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {item.type}
                      </span>

                      {item.type === "CV" && item.hasAIVersion && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          AI CV
                        </span>
                      )}

                      {item.type === "CV" && (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          {getCVLanguageLabel(item.language)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">{item.date}</p>

                    <p className="mt-2 text-gray-600">{item.description}</p>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-2">
                    {item.type === "Motivaciono pismo" && (
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Prikaži
                      </button>
                    )}

                    {item.type === "CV" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenCV(item.id)}
                          disabled={openingCVId === item.id}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {openingCVId === item.id
                            ? "Otvaranje..."
                            : item.hasAIVersion
                              ? "Otvori AI CV"
                              : "Otvori"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCV(item.id)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                        >
                          Obriši
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* EMPTY */}

              {filteredItems.length === 0 && (
                <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
                  <div className="text-5xl">📂</div>

                  <h2 className="mt-4 text-xl font-bold text-slate-800">
                    No history found
                  </h2>

                  <p className="mt-2 text-gray-500">
                    Your saved content will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* ================================================= */}
      {/* COVER LETTER MODAL */}
      {/* ================================================= */}

      {selectedCoverLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseCoverLetter}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b bg-white p-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedCoverLetter.position}
                </h2>

                <p className="mt-1 text-gray-500">
                  {selectedCoverLetter.company}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyCoverLetter}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCoverLetterPDF}
                  disabled={downloading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>

                <button
                  type="button"
                  onClick={handleCloseCoverLetter}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>

            {/* LETTER PREVIEW */}

            <div className="p-8">
              <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
                <div className="mb-6 border-b pb-5">
                  <h3 className="text-xl font-bold text-slate-800">
                    {selectedCoverLetter.fullName}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Application for {selectedCoverLetter.position}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {selectedCoverLetter.company}
                  </p>
                </div>

                <div className="whitespace-pre-wrap leading-7 text-gray-700">
                  {selectedCoverLetter.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* HIDDEN PDF VERSION */}
      {/* ================================================= */}

      {selectedCoverLetter && (
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
            <div
              style={{
                whiteSpace: "pre-wrap",

                overflowWrap: "break-word",
              }}
            >
              {selectedCoverLetter.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
