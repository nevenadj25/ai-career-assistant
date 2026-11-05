interface Props {
  data: string[];
  setData: (data: string[]) => void;
}

const SkillsForm = ({ data, setData }: Props) => {
  const addSkill = () => {
    setData([...data, ""]);
  };

  const updateSkill = (index: number, value: string) => {
    const updatedSkills = [...data];

    updatedSkills[index] = value;

    setData(updatedSkills);
  };

  const removeSkill = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Veštine</h2>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte veštine koje želite da prikažete u CV-ju.
          </p>
        </div>

        <button
          type="button"
          onClick={addSkill}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Dodaj veštinu
        </button>
      </div>

      {/* EMPTY STATE */}

      {data.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="text-4xl">💡</div>

          <h3 className="mt-3 font-semibold text-gray-700">
            Nema dodatih veština
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Kliknite na "Dodaj veštinu" da dodate prvu veštinu.
          </p>
        </div>
      )}

      {/* SKILLS */}

      <div className="space-y-3">
        {data.map((skill, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-semibold text-indigo-600">
              {index + 1}
            </div>

            <input
              type="text"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              placeholder="npr. React, TypeScript, JavaScript..."
              className="flex-1 rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="rounded-xl px-3 py-2 text-red-500 transition hover:bg-red-50"
              title="Delete skill"
            >
              Obriši
            </button>
          </div>
        ))}
      </div>

      {/* PREVIEW */}

      {data.some((skill) => skill.trim()) && (
        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="mb-3 text-sm font-semibold text-gray-600">
            Prikaz veština
          </p>

          <div className="flex flex-wrap gap-2">
            {data
              .filter((skill) => skill.trim())
              .map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SkillsForm;
