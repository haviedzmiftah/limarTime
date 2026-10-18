import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "limarTime - Sistem Informasi Penjadwalan SMP Negeri 1 Ngawi",
  description: "Portal jadwal pelajaran pintar, real-time timetable matrix, dan GraphQL API untuk SMP Negeri 1 Ngawi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "limarTime",
  },
};

export const viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} dark h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-[#090d16] text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
