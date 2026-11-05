import type { Education } from "../../types/cv";

interface Props {
  data: Education[];
  setData: (data: Education[]) => void;
}

const EducationForm = ({ data, setData }: Props) => {
  const handleChange = (id: number, field: keyof Education, value: string) => {
    setData(
      data.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addEducation = () => {
    setData([
      ...data,
      {
        id: Date.now(),
        school: "",
        degree: "",
        field: "",
        city: "",
        startYear: "",
        endYear: "",
      },
    ]);
  };

  const removeEducation = (id: number) => {
    setData(data.filter((item) => item.id !== id));
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Education</h2>

        <button
          type="button"
          onClick={addEducation}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          + Add Education
        </button>
      </div>

      <div className="space-y-8">
        {data.map((education, index) => (
          <div
            key={education.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Education #{index + 1}</h3>

              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(education.id)}
                  className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                className="rounded-lg border p-3 outline-none focus:border-blue-500"
                placeholder="School / University"
                value={education.school}
                onChange={(e) =>
                  handleChange(education.id, "school", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3 outline-none focus:border-blue-500"
                placeholder="Degree"
                value={education.degree}
                onChange={(e) =>
                  handleChange(education.id, "degree", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3 outline-none focus:border-blue-500"
                placeholder="Field of Study"
                value={education.field}
                onChange={(e) =>
                  handleChange(education.id, "field", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3 outline-none focus:border-blue-500"
                placeholder="City"
                value={education.city}
                onChange={(e) =>
                  handleChange(education.id, "city", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3 outline-none focus:border-blue-500"
                placeholder="Start Year"
                value={education.startYear}
                onChange={(e) =>
                  handleChange(education.id, "startYear", e.target.value)
                }
              />

              <input
                className="rounded-lg border p-3 outline-none focus:border-blue-500"
                placeholder="End Year"
                value={education.endYear}
                onChange={(e) =>
                  handleChange(education.id, "endYear", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationForm;
