interface Props {
  suggestions: string[];
}

const SuggestionList = ({ suggestions }: Props) => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">AI Suggestions</h2>

      <ul className="space-y-3">
        {suggestions.map((item, index) => (
          <li key={index} className="rounded-lg bg-indigo-50 p-3">
            ✨ {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SuggestionList;
