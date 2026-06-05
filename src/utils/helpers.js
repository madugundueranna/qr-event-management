// src/utils/helpers.js

/**
 * Debounce a function call
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a simple unique ID
 */
export function generateId(prefix = "ID") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Safely parse JSON, returning a fallback value on error
 */
export function safeParseJSON(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Get initials from a full name
 */
export function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Filter properties by query string matching title and location
 */
export function filterByQuery(items, query, fields = ["title", "location"]) {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter((item) =>
    fields.some((field) =>
      String(item[field] ?? "").toLowerCase().includes(q)
    )
  );
}
