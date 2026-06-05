// src/components/common/Input.jsx

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    id,
    icon,
    error,
    className = "",
    type = "text",
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`form-input ${icon ? "pl-11" : ""} ${
            error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Input;
