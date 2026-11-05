const JobAnalysisForm = () => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold">Analyze Job Position</h2>

      <label className="mb-2 block font-medium">Target position</label>

      <input
        className="mb-5 w-full rounded-lg border p-3"
        placeholder="Frontend Developer"
      />

      <label className="mb-2 block font-medium">Job description</label>

      <textarea
        rows={6}
        className="w-full rounded-lg border p-3"
        placeholder="Paste job description..."
      />

      <button
        className="
        mt-6
        rounded-lg
        bg-indigo-600
        px-6
        py-3
        text-white
        hover:bg-indigo-700
        "
      >
        Analyze with AI ✨
      </button>
    </section>
  );
};

export default JobAnalysisForm;
