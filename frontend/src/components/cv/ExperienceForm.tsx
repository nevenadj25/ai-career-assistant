import type { Experience } from "../../types/cv";

interface Props {
  data: Experience[];
  setData: (data: Experience[]) => void;
}

const ExperienceForm = ({ data, setData }: Props) => {
  const handleChange = (id: number, field: keyof Experience, value: string) => {
    setData(
      data.map((experience) =>
        experience.id === id
          ? {
              ...experience,
              [field]: value,
            }
          : experience,
      ),
    );
  };

  const addExperience = () => {
    setData([
      ...data,
      {
        id: Date.now(),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id: number) => {
    setData(data.filter((experience) => experience.id !== id));
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Iskustvo</h2>

        <button
          type="button"
          onClick={addExperience}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          + Dodaj iskustvo
        </button>
      </div>

      <div className="space-y-8">
        {data.map((experience, index) => (
          <div
            key={experience.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            <div className="mb-5 flex justify-between">
              <h3 className="text-lg font-semibold">Iskustvo #{index + 1}</h3>

              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperience(experience.id)}
                  className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                className="rounded-lg border p-3"
                placeholder="Company"
                value={experience.company}
                onChange={(e) =>
                  handleChange(experience.id, "company", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3"
                placeholder="Position"
                value={experience.position}
                onChange={(e) =>
                  handleChange(experience.id, "position", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3"
                placeholder="Location"
                value={experience.location}
                onChange={(e) =>
                  handleChange(experience.id, "location", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3"
                placeholder="Start date"
                value={experience.startDate}
                onChange={(e) =>
                  handleChange(experience.id, "startDate", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3"
                placeholder="End date"
                value={experience.endDate}
                onChange={(e) =>
                  handleChange(experience.id, "endDate", e.target.value)
                }
              />

              <textarea
                className="rounded-lg border p-3 md:col-span-2"
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
                value={experience.description}
                onChange={(e) =>
                  handleChange(experience.id, "description", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceForm;
