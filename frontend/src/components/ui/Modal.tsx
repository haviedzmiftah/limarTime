import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "md",
  children,
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={cn(
          "w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all",
          maxWidths[maxWidth]
        )}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
