// src/components/common/Select.jsx

import { forwardRef } from "react";

const Select = forwardRef(function Select(
  { label, id, options = [], error, className = "", placeholder, ...props },
  ref
) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`form-select ${
          error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Select;
