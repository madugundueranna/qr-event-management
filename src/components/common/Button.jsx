// src/components/common/Button.jsx

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    gold: "btn-gold",
    outline: "btn-outline",
    ghost: "rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100",
  };

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
