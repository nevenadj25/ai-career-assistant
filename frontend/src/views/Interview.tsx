import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Interview = () => {
  const [position, setPosition] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Mixed");

  const [technologySearch, setTechnologySearch] = useState("");
  const [customTechnology, setCustomTechnology] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const [questions, setQuestions] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [interviewId, setInterviewId] = useState<number | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [performance, setPerformance] = useState("");
  const [feedback, setFeedback] = useState<string[]>([]);
  const [evaluating, setEvaluating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const technologyCategories = {
    "Web programiranje": [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Angular",
      "Vue.js",
      "Next.js",
      "Node.js",
      "Express.js",
      "PHP",
      "Laravel",
      ".NET",
      "ASP.NET",
    ],

    Programiranje: [
      "Java",
      "Python",
      "C",
      "C++",
      "C#",
      "Go",
      "Rust",
      "Kotlin",
      "Swift",
    ],

    Baze: [
      "SQL",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "SQLite",
      "Oracle",
      "Microsoft SQL Server",
    ],

    "Cloud & DevOps": [
      "AWS",
      "Microsoft Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitHub Actions",
      "Terraform",
      "CI/CD",
      "Linux",
    ],

    "Testiranje & QA": [
      "Software Testing",
      "Manual Testing",
      "Automation Testing",
      "Selenium",
      "Cypress",
      "Playwright",
      "JUnit",
      "Jest",
      "Postman",
      "TestNG",
    ],

    "AI & Data": [
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "Data Science",
      "Data Analysis",
      "Pandas",
      "NumPy",
      "TensorFlow",
      "PyTorch",
      "NLP",
      "Generative AI",
    ],

    "Razvoj mobilnih aplikacija": [
      "Android",
      "Flutter",
      "React Native",
      "Swift",
      "Kotlin",
      "Jetpack Compose",
    ],

    "Druge veštine": [
      "Git",
      "GitHub",
      "REST API",
      "GraphQL",
      "Microservices",
      "System Design",
      "Object-Oriented Programming",
      "Algorithms & Data Structures",
      "Cybersecurity",
      "Networking",
      "Agile",
      "Scrum",
    ],
  };

  const toggleTechnology = (technology: string) => {
    if (technologies.includes(technology)) {
      setTechnologies(technologies.filter((item) => item !== technology));
    } else {
      setTechnologies([...technologies, technology]);
    }
  };

  const addCustomTechnology = () => {
    const technology = customTechnology.trim();

    if (!technology) {
      return;
    }

    if (!technologies.includes(technology)) {
      setTechnologies([...technologies, technology]);
    }

    setCustomTechnology("");
  };

  const removeTechnology = (technology: string) => {
    setTechnologies(technologies.filter((item) => item !== technology));
  };

  const generateInterview = async () => {
    if (!position.trim()) {
      setError("Unesite poziciju.");
      return;
    }

    if (technologies.length === 0) {
      setError("Izaberite bar jednu tehnologiju.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/interviews/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: 1,
            position,
            technologies,
            numberOfQuestions,
            difficulty,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Greška prilikom generisanja intervjua.",
        );
      }

      setInterviewId(data.interviewId);
      setQuestions(data.questions);
      setStarted(true);
      setCurrentQuestion(0);
      setAnswers([]);
      setAnswer("");
      setFinished(false);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Greška prilikom generisanja intervjua.",
      );
    } finally {
      setLoading(false);
    }
  };

  const evaluateInterview = async () => {
    if (!interviewId) {
      setError("Intervju nije pronađen.");
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/interviews/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId: interviewId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Greška prilikom evaluacije intervjua.",
        );
      }

      setScore(data.evaluation.score);
      setPerformance(data.evaluation.performance);
      setFeedback(data.evaluation.feedback);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Greška prilikom evaluacije intervjua.",
      );
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = async () => {
    if (!answer.trim()) {
      return;
    }

    if (!interviewId) {
      setError("Intervju nije pronađen.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/interviews/answer",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId: interviewId,
            questionNumber: currentQuestion + 1,
            answer: answer,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Greška prilikom čuvanja odgovora.");
      }

      const updatedAnswers = [...answers, answer];

      setAnswers(updatedAnswers);
      setAnswer("");

      if (currentQuestion === questions.length - 1) {
        setFinished(true);
        await evaluateInterview();
        return;
      }

      setCurrentQuestion((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Greška prilikom čuvanja odgovora.",
      );
    }
  };

  const restartInterview = () => {
    setPosition("");
    setTechnologies([]);
    setNumberOfQuestions(5);
    setDifficulty("Mixed");

    setTechnologySearch("");
    setCustomTechnology("");
    setOpenCategory(null);

    setQuestions([]);
    setStarted(false);
    setInterviewId(null);

    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setFinished(false);

    setScore(null);
    setPerformance("");
    setFeedback([]);

    setError("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-800">
            AI Intervju
          </h1>

          <p className="mb-8 text-gray-600">
            Vežbaj pitanja kroz tehnički intervju na osnovu tvoje pozicije i
            izabranih tehnologija.
          </p>

          {!started && (
            <section className="rounded-3xl bg-white p-8 shadow-xl">
              {/* POSITION */}

              <div className="mb-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Pozicija
                </label>

                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* TECHNOLOGIES */}

              <div className="mb-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tehnologije i veštine
                </label>

                <p className="mb-4 text-sm text-gray-500">
                  Izaberi tehnologije i veštine koje želiš da provežbaš.
                </p>

                {/* SEARCH */}

                <div className="mb-5">
                  <input
                    type="text"
                    value={technologySearch}
                    onChange={(e) => setTechnologySearch(e.target.value)}
                    placeholder="Pronađi tehnologiju..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* SELECTED TECHNOLOGIES */}

                {technologies.length > 0 && (
                  <div className="mb-5 rounded-xl bg-indigo-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-indigo-700">
                      Izabrane tehnologije:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {technologies.map((technology) => (
                        <button
                          key={technology}
                          type="button"
                          onClick={() => removeTechnology(technology)}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                          {technology} ×
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CATEGORIES */}

                <div className="space-y-3">
                  {Object.entries(technologyCategories).map(
                    ([category, categoryTechnologies]) => {
                      const filteredTechnologies = categoryTechnologies.filter(
                        (technology) =>
                          technology
                            .toLowerCase()
                            .includes(technologySearch.toLowerCase()),
                      );

                      if (filteredTechnologies.length === 0) {
                        return null;
                      }

                      const isOpen = openCategory === category;

                      return (
                        <div key={category}>
                          {/* CATEGORY DROPDOWN */}

                          <button
                            type="button"
                            onClick={() =>
                              setOpenCategory(isOpen ? null : category)
                            }
                            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-indigo-400 hover:bg-indigo-50"
                          >
                            <span className="font-semibold text-slate-700">
                              {category}
                            </span>

                            <span className="text-gray-400">
                              {isOpen ? "▲" : "▼"}
                            </span>
                          </button>

                          {/* TECHNOLOGIES */}

                          {isOpen && (
                            <div className="mt-2 rounded-xl bg-gray-50 p-4">
                              <div className="flex flex-wrap gap-2">
                                {filteredTechnologies.map((technology) => {
                                  const selected =
                                    technologies.includes(technology);

                                  return (
                                    <button
                                      key={technology}
                                      type="button"
                                      onClick={() =>
                                        toggleTechnology(technology)
                                      }
                                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                        selected
                                          ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                                          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
                                      }`}
                                    >
                                      {selected ? "✓ " : "+ "}
                                      {technology}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>

                {/* CUSTOM TECHNOLOGY */}

                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Dodajte tehnologiju
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTechnology}
                      onChange={(e) => setCustomTechnology(e.target.value)}
                      placeholder="e.g. Tailwind CSS"
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={addCustomTechnology}
                      className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                    >
                      Dodaj
                    </button>
                  </div>
                </div>
              </div>

              {/* DIFFICULTY */}

              <div className="mb-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Težina
                </label>

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Beginner">Početni</option>
                  <option value="Intermediate">Osnovni</option>
                  <option value="Advanced">Napredni</option>
                  <option value="Mixed">Pomešani</option>
                </select>
              </div>

              {/* NUMBER OF QUESTIONS */}

              <div className="mb-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Broj pitanja
                </label>

                <select
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* GENERATE */}

              <button
                type="button"
                onClick={generateInterview}
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Generisanje intervjua..." : "Izgeneriši intervju"}
              </button>
            </section>
          )}

          {/* INTERVIEW */}

          {started && !finished && questions.length > 0 && (
            <section className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">
                    Pitanje {currentQuestion + 1} of {questions.length}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-800">
                    Tehnički intervju
                  </h2>
                </div>

                <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                  {difficulty}
                </div>
              </div>

              <div className="mb-6 rounded-2xl bg-slate-50 p-6">
                <p className="text-lg font-semibold leading-relaxed text-slate-800">
                  {questions[currentQuestion]}
                </p>
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Napiši tvoj odgovor ovde..."
                rows={8}
                className="mb-5 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              {error && (
                <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={!answer.trim()}
                className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentQuestion === questions.length - 1
                  ? "Završi intervju"
                  : "Sledeće pitanje"}
              </button>
            </section>
          )}

          {/* FINISHED */}

          {finished && (
            <section className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-3xl font-bold text-slate-800">
                  Intervju završen
                </h2>

                <p className="text-gray-600">
                  Vaš intervju je procenjen od strane AI.
                </p>
              </div>

              {evaluating ? (
                <div className="py-10 text-center">
                  <p className="text-lg font-semibold text-slate-700">
                    AI procenjuje vaše odgovore...
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Sačekajte trenutak
                  </p>
                </div>
              ) : (
                <>
                  {score !== null && (
                    <div className="mb-8 text-center">
                      <p className="mb-2 text-sm font-semibold text-gray-500">
                        Tvoj rezultat
                      </p>

                      <div className="text-6xl font-bold text-indigo-600">
                        {score}%
                      </div>

                      <p className="mt-3 text-xl font-semibold text-slate-700">
                        {performance}
                      </p>
                    </div>
                  )}

                  {feedback.length > 0 && (
                    <div className="mb-8 rounded-2xl bg-indigo-50 p-6">
                      <h3 className="mb-4 text-lg font-bold text-slate-800">
                        AI povratna info
                      </h3>

                      <ul className="space-y-3">
                        {feedback.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm leading-relaxed text-slate-700"
                          >
                            <span className="font-bold text-indigo-600">•</span>

                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={restartInterview}
                    className="w-full rounded-xl bg-slate-800 px-6 py-4 font-semibold text-white transition hover:bg-slate-700"
                  >
                    Započni novi intervju
                  </button>
                </>
              )}
            </section>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Interview;
