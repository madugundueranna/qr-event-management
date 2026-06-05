// src/components/common/Badge.jsx

const variants = {
  gold: "bg-gold-50 text-gold-700 border border-gold-200",
  primary: "bg-primary-50 text-primary-700 border border-primary-200",
  green: "bg-green-50 text-green-700 border border-green-200",
  orange: "bg-orange-50 text-orange-700 border border-orange-200",
  red: "bg-red-50 text-red-700 border border-red-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  slate: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function Badge({ children, variant = "slate", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
