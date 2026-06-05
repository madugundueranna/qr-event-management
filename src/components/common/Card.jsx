// src/components/common/Card.jsx

export default function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`glass-card p-6 ${
        hover ? "transition hover:-translate-y-1 hover:shadow-card" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
