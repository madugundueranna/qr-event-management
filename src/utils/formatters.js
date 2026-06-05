// src/utils/formatters.js

/**
 * Format a number as Indian currency (₹ lakhs / crores)
 */
export function formatPrice(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

/**
 * Format a number with Indian comma separators
 */
export function formatNumber(value) {
  return Number(value).toLocaleString("en-IN");
}

/**
 * Format area value with unit
 */
export function formatArea(sqft) {
  return `${Number(sqft).toLocaleString("en-IN")} sq.ft`;
}

/**
 * Format a date string to readable format
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a price per sq.ft
 */
export function formatPricePerSqft(price, area) {
  if (!area || area === 0) return "N/A";
  const perSqft = Math.round(price / area);
  return `₹${formatNumber(perSqft)}/sq.ft`;
}

/**
 * Truncate a string to a max length
 */
export function truncate(str, maxLen = 60) {
  if (!str) return "";
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
}
