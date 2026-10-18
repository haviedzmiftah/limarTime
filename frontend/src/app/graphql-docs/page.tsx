"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Share2, Code, Terminal, ExternalLink, Check, Copy, Play, Sparkles } from "lucide-react";
import { useState } from "react";

export default function GraphQLDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // In-Browser GraphQL Explorer State
  const [activeQuery, setActiveQuery] = useState(`query GetSchedule {
  schoolInfo {
    name
    totalClasses
    totalTeachers
  }
  schedule(className: "7A", day: "Senin") {
    period
    timeRange
    isBreak
    subjectName
    teacherName
    teacherCode
  }
}`);

  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const sampleQuery = `query GetTodaySchedule {
  schedule(className: "8B", day: "Senin") {
    period
    timeRange
    subjectName
    teacherName
    teacherCode
    room
  }
}`;

  const jsSnippet = `// Contoh Fetch GraphQL API dari Website Eksternal (WordPress / Portal Sekolah)
async function fetchSchedule() {
  const query = \`
    query {
      schedule(className: "8B", day: "Senin") {
        period
        timeRange
        subjectName
        teacherName
      }
    }
  \`;

  const response = await fetch("http://localhost:3000/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const { data } = await response.json();
  console.log("Jadwal Terkini:", data.schedule);
}`;

  const embedSnippet = `<!-- Pasang snippet ini di website sekolah mana pun untuk menampilkan widget live -->
<div id="limartime-widget"></div>
<script 
  src="http://localhost:3000/widget.js" 
  data-container="limartime-widget"
  data-endpoint="http://localhost:3000/api/graphql"
  data-class="7A"
  data-day="Senin">
</script>`;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunQuery = async () => {
    try {
      setIsRunning(true);
      setQueryResult(null);
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: activeQuery }),
      });
      const data = await res.json();
      setQueryResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setQueryResult(JSON.stringify({ error: err.message || "Request failed" }, null, 2));
    } finally {
      setIsRunning(false);
    }
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
          <h1 className="text-3xl font-extrabold text-white mt-2">GraphQL API Endpoint & Widget</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gunakan endpoint terpadu ini untuk menyematkan data jadwal harian SMP Negeri 1 Ngawi ke website lain, aplikasi mobile, atau display layar informasi sekolah.
          </p>
        </div>

        {/* Endpoint Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Public GraphQL API Endpoint
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full glow-badge-emerald">
              CORS ENABLED (OPEN ACCESS)
            </span>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-blue-400">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold">POST</span>
            <span className="text-slate-200">/api/graphql</span>
          </div>
        </div>

        {/* In-Browser Interactive GraphQL Explorer */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">Interactive GraphQL Explorer</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Uji coba query langsung di dalam browser</p>
            </div>
            <button
              onClick={handleRunQuery}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? "Menjalankan..." : "Jalankan Query"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Editor Query:</span>
              <textarea
                value={activeQuery}
                onChange={(e) => setActiveQuery(e.target.value)}
                rows={12}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Hasil Response JSON:</span>
              <pre className="w-full h-[235px] p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-y-auto">
                {queryResult || "// Klik 'Jalankan Query' untuk melihat response"}
              </pre>
            </div>
          </div>
        </div>

        {/* Web Widget Embed Snippet */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Web Widget Embed Code (HTML Snippet Siap Pakai)</span>
            </h2>
            <button
              onClick={() => handleCopy(embedSnippet, 3)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 3 ? "Disalin!" : "Salin Snippet"}</span>
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto">
            {embedSnippet}
          </pre>
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
