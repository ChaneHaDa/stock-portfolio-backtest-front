"use client";

import { CHART_COLORS } from "@/utils/constants";
import { formatPercentage } from "@/utils/formatters";
import { MonthlyData, PortfolioPerformanceItem } from "./types";

interface DetailedAnalysisSectionProps {
  monthlyPerformanceData: MonthlyData[];
  portfolioItems: PortfolioPerformanceItem[];
}

const DetailedAnalysisSection = ({ monthlyPerformanceData, portfolioItems }: DetailedAnalysisSectionProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V9a2 2 0 00-2 2H10a2 2 0 00-2-2V7m0 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">월별 수익률 상세</h3>
        </div>
        <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">기간</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyPerformanceData.map(({ date, return: ror }) => (
                <tr key={date} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 font-medium">{date}</td>
                  <td className={`px-4 py-3 text-right font-bold ${ror >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    <div className="flex items-center justify-end gap-2">
                      {ror >= 0 ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {formatPercentage(ror)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">개별 종목 분석</h3>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {portfolioItems.map((stock, index) => (
            <div key={stock.name || stock.customStockName || index} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                  <h4 className="font-bold text-slate-800">{stock.name || stock.customStockName || "알 수 없음"}</h4>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${stock.totalRor >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatPercentage(stock.totalRor)}
                  </div>
                  <div className="text-xs text-slate-500">총 수익률</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-2 rounded-lg">
                  <div className="text-emerald-600 font-semibold">{formatPercentage(Math.max(...Object.values<number>(stock.monthlyRor)))}</div>
                  <div className="text-slate-500 text-xs">최대 수익률</div>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <div className="text-red-500 font-semibold">{formatPercentage(Math.min(...Object.values<number>(stock.monthlyRor)))}</div>
                  <div className="text-slate-500 text-xs">최대 손실</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysisSection;
