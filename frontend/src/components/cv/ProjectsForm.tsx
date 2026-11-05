import type { Project } from "../../types/cv";

interface Props {
  data: Project[];
  setData: (data: Project[]) => void;
}

const ProjectsForm = ({ data, setData }: Props) => {
  const addProject = () => {
    setData([
      ...data,
      {
        id: Date.now(),
        name: "",
        description: "",
        technologies: "",
        link: "",
      },
    ]);
  };

  const updateProject = (id: number, field: keyof Project, value: string) => {
    setData(
      data.map((project) =>
        project.id === id
          ? {
              ...project,
              [field]: value,
            }
          : project,
      ),
    );
  };

  const removeProject = (id: number) => {
    setData(data.filter((project) => project.id !== id));
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projekti</h2>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte projekte koje želite da prikažete u CV-ju.
          </p>
        </div>

        <button
          type="button"
          onClick={addProject}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Dodaj projekat
        </button>
      </div>

      {/* EMPTY STATE */}

      {data.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="text-4xl"></div>

          <h3 className="mt-3 font-semibold text-gray-700">
            Nema dodatih projekata
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte projekte na kojima ste radili.
          </p>
        </div>
      )}

      {/* PROJECTS */}

      <div className="space-y-6">
        {data.map((project, index) => (
          <div
            key={project.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            {/* PROJECT HEADER */}

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Projekat #{index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeProject(project.id)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                Obriši
              </button>
            </div>

            <div className="space-y-5">
              {/* PROJECT NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Naziv projekat
                </label>

                <input
                  type="text"
                  value={project.name}
                  onChange={(e) =>
                    updateProject(project.id, "name", e.target.value)
                  }
                  placeholder="npr. AI Career Assistant"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Opis
                </label>

                <textarea
                  value={project.description}
                  onChange={(e) =>
                    updateProject(project.id, "description", e.target.value)
                  }
                  rows={4}
                  placeholder="Opišite projekat, svoju ulogu i šta ste napravili..."
                  className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* TECHNOLOGIES */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tehnologije
                </label>

                <input
                  type="text"
                  value={project.technologies}
                  onChange={(e) =>
                    updateProject(project.id, "technologies", e.target.value)
                  }
                  placeholder="React, TypeScript, Node.js, PostgreSQL..."
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Unesite tehnologije razdvojene zarezom.
                </p>
              </div>

              {/* LINK */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Link projekta
                </label>

                <input
                  type="url"
                  value={project.link}
                  onChange={(e) =>
                    updateProject(project.id, "link", e.target.value)
                  }
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* PROJECT PREVIEW */}

            {(project.name || project.description || project.technologies) && (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <p className="mb-3 text-sm font-semibold text-gray-500">
                  Prikaz projekta
                </p>

                {project.name && (
                  <h4 className="text-lg font-bold text-slate-800">
                    {project.name}
                  </h4>
                )}

                {project.description && (
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {project.description}
                  </p>
                )}

                {project.technologies && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies
                      .split(",")
                      .map((technology) => technology.trim())
                      .filter(Boolean)
                      .map((technology, technologyIndex) => (
                        <span
                          key={`${technology}-${technologyIndex}`}
                          className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700"
                        >
                          {technology}
                        </span>
                      ))}
                  </div>
                )}

                {project.link && (
                  <p className="mt-4 text-sm font-medium text-indigo-600">
                    Link {project.link}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsForm;
