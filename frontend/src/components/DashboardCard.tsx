interface DashboardCardProps {
  icon: string;
  title: string;
  value: string;
  description: string;
}

const DashboardCard = ({
  icon,
  title,
  value,
  description,
}: DashboardCardProps) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
          {icon}
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold text-gray-700">{title}</h3>

      <p className="mt-2 text-4xl font-bold text-indigo-600">{value}</p>

      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default DashboardCard;
