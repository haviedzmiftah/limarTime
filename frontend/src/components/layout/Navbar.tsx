"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Calendar, Shield, Share2, Layers, BookOpen, Printer } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Portal Publik", icon: Clock },
    { href: "/matrix", label: "Matriks Jadwal", icon: Layers },
    { href: "/export", label: "Cetak & Ekspor", icon: Printer },
    { href: "/graphql-docs", label: "GraphQL API", icon: Share2 },
    { href: "/admin", label: "Admin Kurikulum", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                limarTime
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full glow-badge-blue">
                SMPN 1 Ngawi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sistem Informasi Jadwal Pembelajaran Pintar
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
