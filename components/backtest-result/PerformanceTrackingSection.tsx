"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercentage } from "@/utils/formatters";
import { PerformanceChartPoint } from "./types";

interface PerformanceTrackingSectionProps {
  latestCumulativeReturn: number;
  normalizedMaxDrawdown: number;
  winningRate: number;
  performanceChartData: PerformanceChartPoint[];
  drawdownDomainMin: number;
}

const PerformanceTrackingSection = ({
  latestCumulativeReturn,
  normalizedMaxDrawdown,
  winningRate,
  performanceChartData,
  drawdownDomainMin,
}: PerformanceTrackingSectionProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800">포트폴리오 퍼포먼스 트래킹</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-700 mb-1">누적 수익률</p>
          <p className={`text-xl font-bold ${latestCumulativeReturn >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {formatPercentage(latestCumulativeReturn)}
          </p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold text-red-700 mb-1">최대 낙폭 (MDD)</p>
          <p className="text-xl font-bold text-red-500">{formatPercentage(normalizedMaxDrawdown)}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">월 승률</p>
          <p className="text-xl font-bold text-blue-600">{winningRate.toFixed(1)}%</p>
        </div>
      </div>
      <div className="h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceChartData} margin={{ top: 18, right: 12, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="cumulativeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 12 }} interval="preserveStartEnd" minTickGap={28} tickMargin={10} />
            <YAxis tickFormatter={(value) => `${value}%`} width={58} tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                boxShadow: "0 12px 22px -8px rgba(15, 23, 42, 0.45)",
              }}
              formatter={(value: number, name: string) => {
                const labelMap: Record<string, string> = {
                  cumulativeReturn: "누적 수익률",
                  monthlyReturn: "월 수익률",
                };

                return [
                  <span key={name} className="font-semibold text-emerald-300">
                    {value.toFixed(2)}%
                  </span>,
                  labelMap[name] || name,
                ];
              }}
              labelFormatter={(label) => <span className="text-slate-300 font-medium">{label}</span>}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="cumulativeReturn" stroke="none" fill="url(#cumulativeArea)" />
            <Line
              type="monotone"
              dataKey="cumulativeReturn"
              stroke={latestCumulativeReturn >= 0 ? "#059669" : "#dc2626"}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: latestCumulativeReturn >= 0 ? "#059669" : "#dc2626" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
        <p className="text-xs font-semibold text-red-700 mb-2">낙폭 구간 (Drawdown)</p>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceChartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="drawdownArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#fecaca" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis
                tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
                width={50}
                tick={{ fill: "#ef4444", fontSize: 11 }}
                domain={[drawdownDomainMin, 0]}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "10px",
                }}
                formatter={(value: number) => [
                  <span key="drawdown" className="text-red-500 font-semibold">
                    {value.toFixed(2)}%
                  </span>,
                  "낙폭",
                ]}
              />
              <ReferenceLine y={0} stroke="#fca5a5" />
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#drawdownArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrackingSection;
