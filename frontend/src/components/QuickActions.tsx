import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: "📄",
      title: "Napravi CV",
      description: "Kreiraj profesionalni CV uz AI asistenta.",
      path: "/cv-builder",
      button: "Kreiraj CV",
    },
    {
      icon: "✉️",
      title: "Motivaciono pismo",
      description: "Generiši personalizovano motivaciono pismo.",
      path: "/cover-letter",
      button: "Napiši pismo",
    },
    {
      icon: "🎤",
      title: "AI Intervju",
      description: "Vežbaj intervju kroz realističnu simulaciju.",
      path: "/interview",
      button: "Započni intervju",
    },
    {
      icon: "📂",
      title: "Istorija",
      description: "Pregledaj prethodne CV-jeve i AI aktivnosti.",
      path: "/history",
      button: "Otvori istoriju",
    },
  ];

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Quick Actions ⚡</h2>

        <p className="mt-1 text-gray-500">
          Brzo pristupite najvažnijim funkcijama.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <div
            key={action.path}
            className="group rounded-2xl bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* ICON */}

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100">
              {action.icon}
            </div>

            {/* CONTENT */}

            <h3 className="text-lg font-bold text-slate-800">{action.title}</h3>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
              {action.description}
            </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() => navigate(action.path)}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
            >
              {action.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
