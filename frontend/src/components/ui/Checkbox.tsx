import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(
            "mt-0.5 w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={checkboxId} className="cursor-pointer">
            {label && (
              <span className="block text-xs font-medium text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-[11px] text-slate-400">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
