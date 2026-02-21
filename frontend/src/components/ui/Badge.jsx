import { clsx } from "../../utils/helpers";

export default function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-700 text-slate-100",
    green: "bg-emerald-700 text-emerald-100",
    yellow: "bg-amber-600 text-amber-100",
    red: "bg-rose-700 text-rose-100",
    blue: "bg-sky-700 text-sky-100"
  };

  return (
    <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", colors[color])}>
      {children}
    </span>
  );
}
