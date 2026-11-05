import type { CVData } from "../../../types/cv";

interface Props {
  data: CVData;
}

const ModernTemplate = ({ data }: Props) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-xl">
      {/* Header */}

      <div className="bg-blue-600 p-8 text-white">
        <h1 className="text-4xl font-bold">
          {data.personalInfo.firstName || "First"}{" "}
          {data.personalInfo.lastName || "Last"}
        </h1>

        <div className="mt-4 space-y-1 text-sm">
          {data.personalInfo.email && <p>✉ {data.personalInfo.email}</p>}

          {data.personalInfo.phone && <p>☎ {data.personalInfo.phone}</p>}

          {data.personalInfo.address && <p>📍 {data.personalInfo.address}</p>}
        </div>
      </div>

      <div className="space-y-8 p-8">
        {/* Experience */}

        {data.experience.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-blue-600">Experience</h2>

            {data.experience.map((item) => (
              <div key={item.id} className="mb-5">
                <h3 className="font-semibold">{item.position}</h3>

                <p className="text-gray-600">{item.company}</p>

                <p className="text-sm text-gray-500">
                  {item.startDate} - {item.endDate}
                </p>

                <p className="mt-2 text-sm">{item.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education */}

        {data.education.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-blue-600">Education</h2>

            {data.education.map((item) => (
              <div key={item.id} className="mb-4">
                <h3 className="font-semibold">{item.school}</h3>

                <p>{item.degree}</p>

                <p className="text-sm text-gray-500">
                  {item.startYear} - {item.endYear}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}

        {data.skills.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-blue-600">Skills</h2>

            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}

        {data.projects.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-blue-600">Projects</h2>

            {data.projects.map((project) => (
              <div key={project.id} className="mb-4">
                <h3 className="font-semibold">{project.name}</h3>

                <p className="text-sm text-gray-600">{project.technologies}</p>

                <p className="mt-2 text-sm">{project.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Certificates */}

        {data.certificates.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-blue-600">
              Certificates
            </h2>

            {data.certificates.map((certificate) => (
              <div key={certificate.id} className="mb-3">
                <h3 className="font-semibold">{certificate.name}</h3>

                <p className="text-sm text-gray-600">{certificate.issuer}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
