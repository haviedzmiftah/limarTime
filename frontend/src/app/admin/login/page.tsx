"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button, Input } from "@/components/ui";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Silakan isi username dan kata sandi.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect ke dashboard admin
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMessage(data.error || "Gagal masuk. Periksa kembali kredensial Anda.");
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan atau server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Glow Effects Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Card Container */}
          <div className="glass-panel border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/30">
            {/* Header / Logo Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Admin Kurikulum
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Masuk untuk mengelola jadwal pelajaran SMP Negeri 1 Ngawi
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin..."
                leftIcon={<User className="w-4 h-4" />}
                isRequired
              />

              <Input
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                isRequired
              />

              {/* Default Credential Hint Box */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kredensial Default:
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Username: <strong className="font-mono text-white">admin</strong></span>
                  <span>Password: <strong className="font-mono text-white">admin123</strong></span>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="md"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Masuk ke Panel Admin
              </Button>
            </form>

            {/* Back to Public Portal */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
              >
                ← Kembali ke Portal Publik Jadwal
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
