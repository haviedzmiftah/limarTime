import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  isRequired?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      isRequired,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-300"
          >
            {label} {isRequired && <span className="text-rose-400">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm rounded-xl py-2 px-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
