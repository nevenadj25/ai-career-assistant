import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import JobAnalysisForm from "../components/ai/JobAnalysisForm";
import ScoreCard from "../components/ai/ScoreCard";
import SuggestionList from "../components/ai/SuggestionList";

import { useState } from "react";

const AIAssistant = () => {
  const [analysis, setAnalysis] = useState({
    score: 85,
    suggestions: [
      "Dodaj više projekata u CV",
      "Istakni TypeScript iskustvo",
      "Dodaj konkretne rezultate u opis iskustva",
    ],
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <h1 className="mb-8 text-4xl font-bold text-slate-800">
            AI Career Assistant
          </h1>

          <div className="grid gap-8 lg:grid-cols-2">
            <JobAnalysisForm />

            <div className="space-y-8">
              <ScoreCard score={analysis.score} />

              <SuggestionList suggestions={analysis.suggestions} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AIAssistant;
