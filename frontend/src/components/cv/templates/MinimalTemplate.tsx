import type { CVData } from "../../../types/cv";

interface Props {
  data: CVData;
}

const MinimalTemplate = ({ data }: Props) => {
  return (
    <div className="rounded-xl bg-white p-10 shadow-xl">
      <header className="border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900">
          {data.personalInfo.firstName || "First"}{" "}
          {data.personalInfo.lastName || "Last"}
        </h1>

        <div className="mt-3 text-sm text-gray-600">
          {data.personalInfo.email}

          <br />

          {data.personalInfo.phone}
        </div>
      </header>

      {data.experience.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold uppercase">Experience</h2>

          {data.experience.map((item) => (
            <div key={item.id} className="mb-5">
              <h3 className="font-semibold">{item.position}</h3>

              <p className="text-gray-600">{item.company}</p>

              <p className="text-sm">{item.description}</p>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold uppercase">Skills</h2>

          <p>{data.skills.map((skill) => skill.name).join(", ")}</p>
        </section>
      )}
    </div>
  );
};

export default MinimalTemplate;
