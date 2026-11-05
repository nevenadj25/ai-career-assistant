interface Props {
  score: number;
}

const ScoreCard = ({ score }: Props) => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold">CV Score</h2>

      <div className="mt-5 text-5xl font-bold text-indigo-600">{score}%</div>

      <p className="mt-3 text-gray-600">Your CV matches the position well.</p>
    </section>
  );
};

export default ScoreCard;
