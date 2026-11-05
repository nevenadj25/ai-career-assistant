import { useNavigate } from "react-router-dom";

import { getUser } from "../utils/auth";

const Hero = () => {
  const navigate = useNavigate();

  const user = getUser();

  const firstName = user?.firstName || "Korisniče";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl md:p-10">
      {/* Decorative elements */}

      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

      <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative z-10 max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <span>🤖</span>
          <span>AI Career Assistant</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight md:text-5xl">
          Zdravo, {firstName}! 👋
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100 md:text-lg">
          Dobrodošli u vaš lični AI Career Assistant. Kreirajte profesionalni
          CV, pripremite se za intervju i unapredite svoju karijeru uz pomoć
          veštačke inteligencije.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/cv-builder")}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            📄 Kreiraj CV
          </button>

          <button
            type="button"
            onClick={() => navigate("/interview")}
            className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            🎤 Vežbaj intervju
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
