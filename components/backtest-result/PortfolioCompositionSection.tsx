"use client";

import { CHART_COLORS } from "@/utils/constants";
import { ChartData } from "@/types/portfolio";
import { CompositionItem, CompositionSort } from "./types";

interface PortfolioCompositionSectionProps {
  portfolioData: ChartData[];
  topPortfolioData: CompositionItem[];
  displayPortfolioData: CompositionItem[];
  compositionSort: CompositionSort;
  onSortChange: (sort: CompositionSort) => void;
}

const PortfolioCompositionSection = ({
  portfolioData,
  topPortfolioData,
  displayPortfolioData,
  compositionSort,
  onSortChange,
}: PortfolioCompositionSectionProps) => {
  const isCompositionScrollable = displayPortfolioData.length > 3;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">포트폴리오 구성</h3>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">총 비중(100%)</p>
            <div className="flex h-10 w-full overflow-hidden rounded-lg bg-slate-200">
              {portfolioData.map((item, index) => (
                <div
                  key={`${item.name}-${index}-segment`}
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                  title={`${item.name} ${item.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">상위 비중</p>
            {topPortfolioData.map((item) => (
              <div key={`top-${item.name}-${item.value}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[item.originalIndex % CHART_COLORS.length] }}
                  />
                  <span className="truncate text-sm text-slate-700" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-800">{item.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">종목별 비중</h3>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSortChange("weightDesc")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  compositionSort === "weightDesc" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                비중순
              </button>
              <button
                type="button"
                onClick={() => onSortChange("inputOrder")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  compositionSort === "inputOrder" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                입력순
              </button>
            </div>
          </div>
          <div className={isCompositionScrollable ? "max-h-[272px] overflow-y-auto pr-1" : ""}>
            <div className="space-y-4">
              {displayPortfolioData.map((item) => (
                <div key={`${item.name}-${item.originalIndex}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[item.originalIndex % CHART_COLORS.length] }}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.name}</h4>
                      <p className="text-sm text-slate-500">종목 {item.originalIndex + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-700">{item.value.toFixed(1)}%</p>
                    <p className="text-sm text-slate-500">비중</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCompositionSection;
