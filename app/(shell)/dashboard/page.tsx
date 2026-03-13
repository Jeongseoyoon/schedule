"use client";

import { useState } from "react";
import type {
  GroundStationInput,
  GroundStationPassResult,
  TrajectoryResult,
} from "@/src/lib/types/coordinates";
import type { TleInput } from "@/src/lib/types/tle";
import { sampleGroundStations, sampleTle } from "@/src/config/sample-data";

interface ApiResponse {
  trajectory: TrajectoryResult;
  passes: GroundStationPassResult[];
}

export default function DashboardPage() {
  const [tle, setTle] = useState<TleInput>(sampleTle);
  const [groundStations, setGroundStations] =
    useState<GroundStationInput[]>(sampleGroundStations);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const startUtc = new Date().toISOString();
      const endUtc = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

      const res = await fetch("/api/passes", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tle,
          groundStations,
          startUtc,
          endUtc,
          stepSec: 10,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-100 md:text-base">
          궤도 & 지상국 입력
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              TLE (Line 1 / Line 2)
            </label>
            <textarea
              value={`${tle.line1}\n${tle.line2}`}
              onChange={(e) => {
                const [l1 = "", l2 = ""] = e.target.value.split("\n");
                setTle((prev) => ({
                  ...prev,
                  line1: l1.trim(),
                  line2: l2.trim(),
                }));
              }}
              className="h-24 w-full resize-none rounded-md border border-slate-800 bg-slate-900/60 p-2 text-xs font-mono text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              지상국 1 (위도, 경도, 고도[m], 최소 고도[deg])
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                step="0.0001"
                value={groundStations[0]?.latitudeDeg ?? ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setGroundStations((prev) => [
                    { ...prev[0], latitudeDeg: v },
                    ...prev.slice(1),
                  ]);
                }}
                placeholder="위도"
                className="rounded-md border border-slate-800 bg-slate-900/60 p-1 text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                step="0.0001"
                value={groundStations[0]?.longitudeDeg ?? ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setGroundStations((prev) => [
                    { ...prev[0], longitudeDeg: v },
                    ...prev.slice(1),
                  ]);
                }}
                placeholder="경도"
                className="rounded-md border border-slate-800 bg-slate-900/60 p-1 text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                value={groundStations[0]?.altitudeM ?? ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setGroundStations((prev) => [
                    { ...prev[0], altitudeM: v },
                    ...prev.slice(1),
                  ]);
                }}
                placeholder="고도[m]"
                className="rounded-md border border-slate-800 bg-slate-900/60 p-1 text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                value={groundStations[0]?.minElevationDeg ?? ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setGroundStations((prev) => [
                    { ...prev[0], minElevationDeg: v },
                    ...prev.slice(1),
                  ]);
                }}
                placeholder="min el"
                className="rounded-md border border-slate-800 bg-slate-900/60 p-1 text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          >
            {loading ? "계산 중..." : "교신 스케줄 계산"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-100 md:text-base">
          지상국별 교신 스케줄
        </h2>
        <PassTable passes={result?.passes ?? []} />
      </section>
    </div>
  );
}

interface PassTableProps {
  passes: GroundStationPassResult[];
}

function PassTable({ passes }: PassTableProps) {
  if (!passes.length) {
    return (
      <p className="text-xs text-slate-500">
        위 TLE와 지상국 정보를 입력한 뒤 &quot;교신 스케줄 계산&quot;을
        눌러주세요.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-xs md:text-sm">
      {passes.map((gs) => (
        <div
          key={gs.groundStationId}
          className="rounded-lg border border-slate-800/80 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium text-slate-100">
              {gs.groundStationName}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-cyan-300">
              {gs.passes.length} passes
            </div>
          </div>
          <div className="max-h-60 overflow-auto rounded-md border border-slate-900/80">
            <table className="min-w-full border-collapse bg-slate-950/60">
              <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="px-2 py-1 text-left">AOS (UTC)</th>
                  <th className="px-2 py-1 text-left">LOS (UTC)</th>
                  <th className="px-2 py-1 text-right">Duration [s]</th>
                  <th className="px-2 py-1 text-right">Max El [deg]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {gs.passes.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="px-2 py-1">{p.aos}</td>
                    <td className="px-2 py-1">{p.los}</td>
                    <td className="px-2 py-1 text-right">
                      {p.durationSec.toFixed(0)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {p.maxElevationDeg.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

