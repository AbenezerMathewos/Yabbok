interface StatusBadgeProps {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

const toneClasses = {
  default: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  info: "bg-gold-500/10 text-gold-600 dark:text-gold-400",
};

export function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-bold ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
