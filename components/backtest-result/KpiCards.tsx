"use client";

import { formatPercentage } from "@/utils/formatters";

interface KpiCardsProps {
  totalRor: number;
  highestMonthlyRor: number;
  lowestMonthlyRor: number;
  totalAmount: number;
}

const KpiCards = ({ totalRor, highestMonthlyRor, lowestMonthlyRor, totalAmount }: KpiCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-600 text-sm font-medium">누적 수익률</p>
          <p className={`text-3xl font-bold ${totalRor >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatPercentage(totalRor)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-600 text-sm font-medium">최고 월 수익률</p>
          <p className="text-3xl font-bold text-emerald-600">{formatPercentage(highestMonthlyRor)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-600 text-sm font-medium">최저 월 수익률</p>
          <p className="text-3xl font-bold text-red-500">{formatPercentage(lowestMonthlyRor)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-600 text-sm font-medium">최종 자산</p>
          <p className="text-3xl font-bold text-slate-700">
            {Number(totalAmount).toLocaleString("ko-KR")}
            <span className="text-lg text-slate-500 ml-1">원</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default KpiCards;
