import { useState } from "react";
import type { CVData } from "../../types/cv";

interface Props {
  data: CVData;
}

const CVAIAnalysis = ({ data }: Props) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const [score, setScore] = useState(0);

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const analyzeCV = () => {
    setAnalyzing(true);
    setAnalyzed(false);

    setTimeout(() => {
      let calculatedScore = 60;

      if (data.personalInfo.firstName && data.personalInfo.lastName) {
        calculatedScore += 5;
      }

      if (data.personalInfo.email) {
        calculatedScore += 5;
      }

      if (data.education.length > 0) {
        calculatedScore += 5;
      }

      if (data.experience.length > 0) {
        calculatedScore += 10;
      }

      if (data.skills.length > 0) {
        calculatedScore += 5;
      }

      if (data.projects.length > 0) {
        calculatedScore += 5;
      }

      if (calculatedScore > 100) {
        calculatedScore = 100;
      }

      setScore(calculatedScore);

      setSuggestions([
        "Dodaj konkretne rezultate u Experience sekciju.",
        "Dodaj više tehničkih veština relevantnih za poziciju.",
        "Dodaj GitHub ili portfolio ako ih imaš.",
        "Koristi konkretne brojeve i rezultate gde je moguće.",
      ]);

      setAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            AI CV Analysis 🤖
          </h2>

          <p className="mt-1 text-gray-500">
            Analiziraj svoj CV i saznaj kako možeš da ga poboljšaš.
          </p>
        </div>

        <button
          type="button"
          onClick={analyzeCV}
          disabled={analyzing}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {analyzing ? "Analyzing..." : "✨ Analyze my CV"}
        </button>
      </div>

      {analyzing && (
        <div className="mt-8 rounded-xl bg-indigo-50 p-6 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

          <p className="mt-4 font-medium text-indigo-700">
            AI is analyzing your CV...
          </p>
        </div>
      )}

      {analyzed && !analyzing && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* SCORE */}

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-500">
              Overall CV Score
            </p>

            <div className="mt-4 text-6xl font-bold text-indigo-600">
              {score}%
            </div>

            <p className="mt-3 text-gray-600">
              {score >= 90
                ? "Excellent CV!"
                : score >= 75
                  ? "Very good CV!"
                  : "There is room for improvement."}
            </p>
          </div>

          {/* SUGGESTIONS */}

          <div>
            <h3 className="mb-4 text-xl font-bold text-slate-800">
              AI Suggestions
            </h3>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl bg-gray-50 p-4"
                >
                  <span className="text-lg">💡</span>

                  <p className="text-sm leading-6 text-gray-700">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CVAIAnalysis;
