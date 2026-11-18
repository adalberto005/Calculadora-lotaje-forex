import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type CardProps = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: "blue" | "amber" | "emerald" | "slate";
};

const accentRing: Record<string, string> = {
  blue: "from-blue-500/10 to-blue-500/0",
  amber: "from-amber-500/10 to-amber-500/0",
  emerald: "from-emerald-500/10 to-emerald-500/0",
  slate: "from-slate-500/10 to-slate-500/0",
};

const accentIcon: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  amber: "bg-amber-500/10 text-amber-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  slate: "bg-slate-500/10 text-slate-600",
};

export function Card({ title, icon, children, className = "", accent = "slate" }: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accentRing[accent]}`} />
      <div className="relative p-5">
        {(title || icon) && (
          <div className="mb-4 flex items-center gap-3">
            {icon && (
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentIcon[accent]}`}>
                {icon}
              </span>
            )}
            {title && <h3 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">{title}</h3>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

type NumberInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  suffix?: string;
  error?: string | null;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, suffix, error, className = "", id, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, "-").toLowerCase();
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
          {label}
        </label>
        <div
          className={`flex items-stretch rounded-lg border bg-slate-50 transition focus-within:bg-white ${
            error ? "border-red-400 focus-within:border-red-500" : "border-slate-200 focus-within:border-blue-500"
          }`}
        >
          <input
            id={inputId}
            ref={ref}
            type="number"
            inputMode="decimal"
            className={`w-full bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 ${className}`}
            {...props}
          />
          {suffix && (
            <span className="flex select-none items-center border-l border-slate-200 px-3 text-xs font-medium text-slate-500">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";

type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex items-stretch rounded-lg border border-slate-200 bg-slate-50 transition focus-within:border-blue-500 focus-within:bg-white">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

type StatProps = {
  label: string;
  value: string;
  unit: string;
  tone?: "blue" | "amber" | "emerald" | "slate";
};

const statTone: Record<string, string> = {
  blue: "text-blue-600",
  amber: "text-amber-600",
  emerald: "text-emerald-600",
  slate: "text-slate-800",
};

export function Stat({ label, value, unit, tone = "slate" }: StatProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${statTone[tone]}`}>{value}</p>
      <p className="text-xs text-slate-400">{unit}</p>
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  disabled?: boolean;
};

export function Button({ children, onClick, variant = "primary", icon, disabled }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {icon}
      {children}
    </button>
  );
}

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
};

export function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
