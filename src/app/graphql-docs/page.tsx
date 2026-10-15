"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Share2, Code, Terminal, ExternalLink, Check, Copy } from "lucide-react";
import { useState } from "react";

export default function GraphQLDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sampleQuery = `query GetTodaySchedule {
  schedule(className: "8B", day: SENIN) {
    period
    startTime
    endTime
    subject {
      name
      code
    }
    teacher {
      name
      code
    }
    room
  }
}`;

  const jsSnippet = `// Contoh Fetch GraphQL API dari Website Eksternal (WordPress / Web Sekolah)
async function fetchSchedule() {
  const query = \`
    query {
      schedule(className: "8B", day: SENIN) {
        period
        startTime
        endTime
        subject { name }
        teacher { name code }
      }
    }
  \`;

  const response = await fetch("https://limartime.smpn1ngawi.sch.id/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const { data } = await response.json();
  console.log("Jadwal Terkini:", data.schedule);
}`;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glow-badge-blue text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" />
            <span>Integrasi Sistem Eksternal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">GraphQL API Endpoint</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gunakan endpoint ini untuk menyematkan data jadwal harian SMP Negeri 1 Ngawi ke website lain atau display layar informasi sekolah.
          </p>
        </div>

        {/* Endpoint Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Public API Endpoint
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full glow-badge-emerald">
              CORS ENABLED (READ-ONLY)
            </span>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-blue-400">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold">POST</span>
            <span className="text-slate-200">/api/graphql</span>
          </div>
        </div>

        {/* Sample Query Code Block */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span>Contoh Query GraphQL</span>
            </h2>
            <button
              onClick={() => handleCopy(sampleQuery, 1)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 1 ? "Disalin!" : "Salin Query"}</span>
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto">
            {sampleQuery}
          </pre>
        </div>

        {/* Client Side Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Contoh Implementasi JavaScript di Website Lain</span>
            </h2>
            <button
              onClick={() => handleCopy(jsSnippet, 2)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 2 ? "Disalin!" : "Salin Kode"}</span>
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto">
            {jsSnippet}
          </pre>
        </div>
      </main>

      <Footer />
    </div>
  );
}
