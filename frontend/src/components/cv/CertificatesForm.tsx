import type { Certificate } from "../../types/cv";

interface Props {
  data: Certificate[];
  setData: (data: Certificate[]) => void;
}

const CertificatesForm = ({ data, setData }: Props) => {
  const addCertificate = () => {
    setData([
      ...data,
      {
        id: Date.now(),
        name: "",
        issuer: "",
        date: "",
        link: "",
      },
    ]);
  };

  const updateCertificate = (
    id: number,
    field: keyof Certificate,
    value: string,
  ) => {
    setData(
      data.map((certificate) =>
        certificate.id === id
          ? {
              ...certificate,
              [field]: value,
            }
          : certificate,
      ),
    );
  };

  const removeCertificate = (id: number) => {
    setData(data.filter((certificate) => certificate.id !== id));
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Certificates</h2>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte sertifikate i profesionalne kvalifikacije.
          </p>
        </div>

        <button
          type="button"
          onClick={addCertificate}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Add Certificate
        </button>
      </div>

      {/* EMPTY STATE */}

      {data.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="text-4xl">🏆</div>

          <h3 className="mt-3 font-semibold text-gray-700">
            No certificates added
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Dodajte sertifikate koje posedujete.
          </p>
        </div>
      )}

      {/* CERTIFICATES */}

      <div className="space-y-6">
        {data.map((certificate, index) => (
          <div
            key={certificate.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            {/* HEADER */}

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Certificate #{index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeCertificate(certificate.id)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Certificate name
                </label>

                <input
                  type="text"
                  value={certificate.name}
                  onChange={(e) =>
                    updateCertificate(certificate.id, "name", e.target.value)
                  }
                  placeholder="npr. AWS Certified Developer"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* ISSUER */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Issuing organization
                </label>

                <input
                  type="text"
                  value={certificate.issuer}
                  onChange={(e) =>
                    updateCertificate(certificate.id, "issuer", e.target.value)
                  }
                  placeholder="npr. Amazon Web Services"
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date
                </label>

                <input
                  type="month"
                  value={certificate.date}
                  onChange={(e) =>
                    updateCertificate(certificate.id, "date", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* LINK */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Certificate link
                </label>

                <input
                  type="url"
                  value={certificate.link}
                  onChange={(e) =>
                    updateCertificate(certificate.id, "link", e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* PREVIEW */}

            {(certificate.name || certificate.issuer || certificate.date) && (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <p className="mb-3 text-sm font-semibold text-gray-500">
                  Certificate preview
                </p>

                {certificate.name && (
                  <h4 className="text-lg font-bold text-slate-800">
                    {certificate.name}
                  </h4>
                )}

                {certificate.issuer && (
                  <p className="mt-1 text-gray-600">{certificate.issuer}</p>
                )}

                {certificate.date && (
                  <p className="mt-2 text-sm text-gray-500">
                    📅 {certificate.date}
                  </p>
                )}

                {certificate.link && (
                  <p className="mt-2 text-sm font-medium text-indigo-600">
                    🔗 {certificate.link}
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

export default CertificatesForm;
