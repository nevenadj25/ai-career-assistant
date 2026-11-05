import type { Language } from "../../types/cv";

interface Props {
  data: Language[];
  setData: (data: Language[]) => void;
}

const LanguagesForm = ({ data, setData }: Props) => {
  const addLanguage = () => {
    setData([
      ...data,
      {
        id: Date.now(),
        name: "",
        level: "",
      },
    ]);
  };

  const updateLanguage = (id: number, field: keyof Language, value: string) => {
    setData(
      data.map((language) =>
        language.id === id
          ? {
              ...language,
              [field]: value,
            }
          : language,
      ),
    );
  };

  const removeLanguage = (id: number) => {
    setData(data.filter((language) => language.id !== id));
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Jezici</h2>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte jezike i nivo znanja.
          </p>
        </div>

        <button
          type="button"
          onClick={addLanguage}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Dodaj jezik
        </button>
      </div>

      {/* EMPTY STATE */}

      {data.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="text-4xl"></div>

          <h3 className="mt-3 font-semibold text-gray-700">
            Nema dodatih jezika
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte jezike koje poznajete.
          </p>
        </div>
      )}

      {/* LANGUAGES */}

      <div className="space-y-5">
        {data.map((language, index) => (
          <div
            key={language.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                Jezik #{index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeLanguage(language.id)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                Obriši
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* LANGUAGE NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Jezik
                </label>

                <input
                  type="text"
                  value={language.name}
                  onChange={(e) =>
                    updateLanguage(language.id, "name", e.target.value)
                  }
                  placeholder="npr. English"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* LEVEL */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Level
                </label>

                <select
                  value={language.level}
                  onChange={(e) =>
                    updateLanguage(language.id, "level", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Izaberite nivo</option>

                  <option value="A1">A1 - Početni</option>

                  <option value="A2">A2 - Osnovni</option>

                  <option value="B1">B1 - Srednji</option>

                  <option value="B2">B2 - Viši srednji</option>

                  <option value="C1">C1 - Visoki</option>

                  <option value="C2">C2 - Veoma visok</option>

                  <option value="Native">Maternji jezik</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW */}

      {data.some(
        (language) => language.name.trim() || language.level.trim(),
      ) && (
        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="mb-3 text-sm font-semibold text-gray-600">
            Languages preview
          </p>

          <div className="flex flex-wrap gap-3">
            {data
              .filter((language) => language.name.trim())
              .map((language) => (
                <div
                  key={language.id}
                  className="rounded-xl bg-white px-4 py-3 shadow-sm"
                >
                  <p className="font-semibold text-gray-800">{language.name}</p>

                  {language.level && (
                    <p className="mt-1 text-sm text-gray-500">
                      {language.level}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default LanguagesForm;
