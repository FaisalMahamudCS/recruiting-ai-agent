export function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
