import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IOPSSPACE Schedule",
  description: "WGS84 / SGP4 기반 위성 교신 스케줄러",
};

export const revalidate = 3600;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#0B1120,_#020617_60%)] text-slate-100 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-cyan-400/80 shadow-lg shadow-cyan-500/50" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight md:text-2xl">
                  IOPSSPACE Schedule
                </h1>
                <p className="text-xs text-slate-400 md:text-sm">
                  WGS84 / SGP4 기반 위성 교신 스케줄러
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
            시간 기준: UTC · 지구 모델: WGS84 · 궤도 모델: NORAD TLE SGP4
          </footer>
        </div>
      </body>
    </html>
  );
}

