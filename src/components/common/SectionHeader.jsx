// src/components/common/SectionHeader.jsx

export default function SectionHeader({
  title,
  subtitle,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div>
        <h2 className="text-2xl font-black text-ink-900">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
