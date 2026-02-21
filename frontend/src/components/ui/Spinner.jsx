export default function Spinner({ className = "h-4 w-4" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-500 border-t-sky-400 ${className}`}
      aria-label="loading"
    />
  );
}
