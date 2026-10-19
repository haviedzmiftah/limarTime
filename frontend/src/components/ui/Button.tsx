import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "gradient";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 border border-blue-500/30",
      gradient:
        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 border border-rose-500/30",
      outline:
        "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700",
      ghost:
        "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200",
    };

    const sizes = {
      xs: "px-2.5 py-1 text-[11px] rounded-lg gap-1.5",
      sm: "px-3.5 py-1.5 text-xs rounded-xl gap-2",
      md: "px-4 py-2 text-xs sm:text-sm rounded-xl gap-2",
      lg: "px-5 py-2.5 text-sm sm:text-base rounded-2xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all select-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] hover:scale-[1.01]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
