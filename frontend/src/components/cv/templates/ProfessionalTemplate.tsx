import type { CVData } from "../../../types/cv";

interface Props {
  data: CVData;
}

const ProfessionalTemplate = ({ data }: Props) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-xl">
      {/* Header */}

      <div className="bg-slate-800 p-8 text-white">
        <h1 className="text-4xl font-bold">
          {data.personalInfo.firstName || "First"}{" "}
          {data.personalInfo.lastName || "Last"}
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-200">
          {data.personalInfo.email && <span>✉ {data.personalInfo.email}</span>}

          {data.personalInfo.phone && <span>☎ {data.personalInfo.phone}</span>}

          {data.personalInfo.address && (
            <span>📍 {data.personalInfo.address}</span>
          )}
        </div>
      </div>

      <div className="grid gap-8 p-8 md:grid-cols-3">
        {/* LEFT COLUMN */}

        <aside className="space-y-8 md:col-span-1">
          {/* Skills */}

          {data.skills.length > 0 && (
            <section>
              <h2 className="mb-3 border-b pb-2 font-bold uppercase text-slate-700">
                Skills
              </h2>

              <ul className="space-y-2 text-sm">
                {data.skills.map((skill) => (
                  <li key={skill.id} className="rounded bg-slate-100 px-3 py-2">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages */}

          {data.languages.length > 0 && (
            <section>
              <h2 className="mb-3 border-b pb-2 font-bold uppercase text-slate-700">
                Languages
              </h2>

              {data.languages.map((language) => (
                <p key={language.id} className="text-sm">
                  {language.name} - {language.level}
                </p>
              ))}
            </section>
          )}

          {/* Certificates */}

          {data.certificates.length > 0 && (
            <section>
              <h2 className="mb-3 border-b pb-2 font-bold uppercase text-slate-700">
                Certificates
              </h2>

              {data.certificates.map((certificate) => (
                <div key={certificate.id} className="mb-3 text-sm">
                  <p className="font-semibold">{certificate.name}</p>

                  <p className="text-gray-600">{certificate.issuer}</p>
                </div>
              ))}
            </section>
          )}
        </aside>

        {/* RIGHT COLUMN */}

        <main className="space-y-8 md:col-span-2">
          {/* Experience */}

          {data.experience.length > 0 && (
            <section>
              <h2 className="mb-4 border-b pb-2 text-xl font-bold text-slate-800">
                Experience
              </h2>

              {data.experience.map((experience) => (
                <div key={experience.id} className="mb-6">
                  <h3 className="font-bold">{experience.position}</h3>

                  <p className="text-gray-600">{experience.company}</p>

                  <p className="text-sm text-gray-500">
                    {experience.startDate}
                    {" - "}
                    {experience.endDate}
                  </p>

                  <p className="mt-2 text-sm">{experience.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Education */}

          {data.education.length > 0 && (
            <section>
              <h2 className="mb-4 border-b pb-2 text-xl font-bold text-slate-800">
                Education
              </h2>

              {data.education.map((education) => (
                <div key={education.id} className="mb-5">
                  <h3 className="font-bold">{education.school}</h3>

                  <p>{education.degree}</p>

                  <p className="text-sm text-gray-500">
                    {education.startYear}
                    {" - "}
                    {education.endYear}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Projects */}

          {data.projects.length > 0 && (
            <section>
              <h2 className="mb-4 border-b pb-2 text-xl font-bold text-slate-800">
                Projects
              </h2>

              {data.projects.map((project) => (
                <div key={project.id} className="mb-5">
                  <h3 className="font-bold">{project.name}</h3>

                  <p className="text-sm text-gray-600">
                    {project.technologies}
                  </p>

                  <p className="mt-2 text-sm">{project.description}</p>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
