import Link from "next/link";
import { Clock, ShieldCheck, Database, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070a12] py-8 px-4 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>
            <strong>limarTime</strong> © 2026 — SMP Negeri 1 Ngawi. Hak Cipta Dilindungi.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Next.js & Drizzle ORM
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> MySQL / PostgreSQL
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> 0-Bentrok Guarantee
          </span>
        </div>
      </div>
    </footer>
  );
}
