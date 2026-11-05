interface Props {
  template: "modern" | "classic" | "minimal";
  setTemplate: (template: "modern" | "classic" | "minimal") => void;
}

const CVTemplateSelector = ({ template, setTemplate }: Props) => {
  const templates = [
    {
      id: "modern" as const,
      name: "Modern",
      description: "Moderan i profesionalan dizajn",
      icon: "✨",
    },
    {
      id: "classic" as const,
      name: "Classic",
      description: "Klasičan i elegantan izgled",
      icon: "📄",
    },
    {
      id: "minimal" as const,
      name: "Minimal",
      description: "Jednostavan i čist dizajn",
      icon: "◻️",
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Choose CV Template
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Izaberite izgled vašeg CV-ja.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {templates.map((item) => {
          const isSelected = template === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTemplate(item.id)}
              className={`
                group
                relative
                rounded-2xl
                border-2
                p-5
                text-left
                transition-all
                duration-300
                ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 shadow-lg"
                    : "border-gray-200 bg-white hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
                }
              `}
            >
              {/* CHECK */}

              {isSelected && (
                <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
                  ✓
                </div>
              )}

              {/* TEMPLATE PREVIEW */}

              <div
                className={`
                  mb-5
                  h-40
                  rounded-xl
                  border
                  bg-white
                  p-4
                  shadow-sm
                  ${
                    item.id === "modern"
                      ? "border-indigo-200"
                      : item.id === "classic"
                        ? "border-gray-300"
                        : "border-gray-200"
                  }
                `}
              >
                {item.id === "modern" && (
                  <div className="space-y-3">
                    <div className="h-4 w-1/2 rounded bg-indigo-600" />

                    <div className="h-2 w-1/3 rounded bg-gray-300" />

                    <div className="mt-5 h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-5/6 rounded bg-gray-200" />
                    <div className="h-2 w-4/6 rounded bg-gray-200" />

                    <div className="mt-4 flex gap-2">
                      <div className="h-5 w-16 rounded bg-indigo-100" />
                      <div className="h-5 w-20 rounded bg-indigo-100" />
                    </div>
                  </div>
                )}

                {item.id === "classic" && (
                  <div className="font-serif">
                    <div className="mx-auto h-4 w-2/3 rounded bg-gray-800" />

                    <div className="mx-auto mt-2 h-2 w-1/2 rounded bg-gray-400" />

                    <div className="mt-5 border-t border-gray-400 pt-3">
                      <div className="h-2 w-full rounded bg-gray-300" />
                      <div className="mt-2 h-2 w-5/6 rounded bg-gray-300" />
                      <div className="mt-2 h-2 w-4/6 rounded bg-gray-300" />
                    </div>
                  </div>
                )}

                {item.id === "minimal" && (
                  <div>
                    <div className="h-3 w-1/2 rounded bg-gray-500" />

                    <div className="mt-2 h-2 w-1/3 rounded bg-gray-300" />

                    <div className="mt-6 space-y-2">
                      <div className="h-2 w-full rounded bg-gray-200" />
                      <div className="h-2 w-5/6 rounded bg-gray-200" />
                      <div className="h-2 w-4/6 rounded bg-gray-200" />
                    </div>

                    <div className="mt-5 h-px w-full bg-gray-300" />
                  </div>
                )}
              </div>

              {/* INFO */}

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg">
                  {item.icon}
                </div>

                <div>
                  <h3
                    className={`font-bold ${
                      isSelected ? "text-indigo-700" : "text-gray-800"
                    }`}
                  >
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* SELECTED TEMPLATE */}

      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Izabrani template:{" "}
        <span className="font-semibold text-indigo-600">
          {templates.find((item) => item.id === template)?.name}
        </span>
      </div>
    </section>
  );
};

export default CVTemplateSelector;
