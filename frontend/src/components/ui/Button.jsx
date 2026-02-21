import { clsx } from "../../utils/helpers";

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const variants = {
    primary: "bg-sky-500 hover:bg-sky-400 text-slate-950",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-rose-600 hover:bg-rose-500 text-white"
  };

  return (
    <button
      className={clsx(
        "rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
