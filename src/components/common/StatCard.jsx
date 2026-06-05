// src/components/common/StatCard.jsx

export default function StatCard({ icon, title, value, change, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary-100 text-primary-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    gold: "bg-gold-100 text-gold-600",
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorMap[color]}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-ink-900">{value}</h3>
          {change && (
            <p className="mt-1 text-xs font-semibold text-green-600">
              ↑ {change} vs last month
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
