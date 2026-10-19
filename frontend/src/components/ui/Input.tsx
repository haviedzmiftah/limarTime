import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isRequired,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-300"
          >
            {label} {isRequired && <span className="text-rose-400">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-500 pointer-events-none shrink-0">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-slate-950/90 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm rounded-xl py-2 px-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-900",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3.5 text-slate-500 flex items-center">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
