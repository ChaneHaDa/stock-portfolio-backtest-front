"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BacktestResult as BacktestResultType, ChartData, MonthlyData, RebalanceFrequency } from "@/types/portfolio";
import { STORAGE_KEYS } from "@/utils/constants";
import { API_BASE_URL } from "@/config/apiConfig";
import DetailedAnalysisSection from "@/components/backtest-result/DetailedAnalysisSection";
import HeaderSection from "@/components/backtest-result/HeaderSection";
import KpiCards from "@/components/backtest-result/KpiCards";
import PerformanceTrackingSection from "@/components/backtest-result/PerformanceTrackingSection";
import PortfolioCompositionSection from "@/components/backtest-result/PortfolioCompositionSection";
import SaveUpdateModal from "@/components/backtest-result/SaveUpdateModal";
import ToastNotification from "@/components/backtest-result/ToastNotification";
import {
  CompositionSort,
  InputPortfolioItem,
  PortfolioPerformanceItem,
  SaveUpdateData,
  ToastState,
  UpdatedPortfolioData,
} from "@/components/backtest-result/types";

interface BacktestResultProps {
  result: BacktestResultType;
}

const REBALANCE_FREQUENCY_LABELS: Record<RebalanceFrequency, string> = {
  NONE: "리밸런싱 안 함",
  DAILY: "일별",
  MONTHLY: "월별",
  QUARTERLY: "분기별",
  YEARLY: "연별",
};

const BacktestResult = ({ result }: BacktestResultProps) => {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  const [compositionSort, setCompositionSort] = useState<CompositionSort>("weightDesc");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updatedPortfolioData, setUpdatedPortfolioData] = useState<UpdatedPortfolioData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const processMonthlyData = useCallback((rorObject: Record<string, number>): MonthlyData[] => {
    return Object.entries(rorObject)
      .map(([date, value]) => ({
        date: date.slice(0, 7),
        return: Number(value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const normalizeWeight = useCallback((weight: number | string): number => {
    const parsedWeight = typeof weight === "number" ? weight : Number(weight);
    return Number.isFinite(parsedWeight) ? parsedWeight : 0;
  }, []);

  const processPortfolioData = useCallback(
    (portfolio: InputPortfolioItem[]): ChartData[] => {
      return portfolio.map((item) => ({
        name: item.stockName || item.customStockName || "알 수 없음",
        value: normalizeWeight(item.weight) * 100,
      }));
    },
    [normalizeWeight]
  );

  const portfolioData = useMemo(
    () => processPortfolioData(result.portfolioInput.portfolioBacktestRequestItemDTOList as InputPortfolioItem[]),
    [processPortfolioData, result.portfolioInput.portfolioBacktestRequestItemDTOList]
  );

  const portfolioDataWithIndex = useMemo(
    () => portfolioData.map((item, originalIndex) => ({ ...item, originalIndex })),
    [portfolioData]
  );

  const topPortfolioData = useMemo(
    () => [...portfolioDataWithIndex].sort((a, b) => b.value - a.value).slice(0, 3),
    [portfolioDataWithIndex]
  );

  const displayPortfolioData = useMemo(
    () =>
      compositionSort === "weightDesc"
        ? [...portfolioDataWithIndex].sort((a, b) => b.value - a.value)
        : portfolioDataWithIndex,
    [compositionSort, portfolioDataWithIndex]
  );

  const monthlyPerformanceData = useMemo(
    () => processMonthlyData(result.monthlyRor),
    [processMonthlyData, result.monthlyRor]
  );

  const performanceChartData = useMemo(() => {
    let cumulativeFactor = 1;
    let peakFactor = 1;

    return monthlyPerformanceData.map(({ date, return: monthlyReturn }) => {
      cumulativeFactor *= 1 + monthlyReturn / 100;
      peakFactor = Math.max(peakFactor, cumulativeFactor);

      const cumulativeReturn = Number(((cumulativeFactor - 1) * 100).toFixed(4));
      const drawdown = Number((((cumulativeFactor / peakFactor) - 1) * 100).toFixed(4));

      return {
        date,
        monthlyReturn,
        cumulativeReturn,
        drawdown,
      };
    });
  }, [monthlyPerformanceData]);

  const latestCumulativeReturn = useMemo(
    () => performanceChartData[performanceChartData.length - 1]?.cumulativeReturn ?? 0,
    [performanceChartData]
  );

  const maxDrawdown = useMemo(
    () => (performanceChartData.length > 0 ? Math.min(...performanceChartData.map((item) => item.drawdown)) : 0),
    [performanceChartData]
  );

  const normalizedMaxDrawdown = useMemo(
    () => (Math.abs(maxDrawdown) < 0.0001 ? 0 : maxDrawdown),
    [maxDrawdown]
  );

  const drawdownDomainMin = useMemo(() => {
    if (normalizedMaxDrawdown >= 0) {
      return -1;
    }

    return Math.floor((normalizedMaxDrawdown - 1) / 2) * 2;
  }, [normalizedMaxDrawdown]);

  const winningRate = useMemo(
    () =>
      monthlyPerformanceData.length > 0
        ? (monthlyPerformanceData.filter((item) => item.return >= 0).length / monthlyPerformanceData.length) * 100
        : 0,
    [monthlyPerformanceData]
  );

  const { highestMonthlyRor, lowestMonthlyRor } = useMemo(() => {
    const monthlyValues = Object.values(result.monthlyRor).map(Number);
    return {
      highestMonthlyRor: monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0,
      lowestMonthlyRor: monthlyValues.length > 0 ? Math.min(...monthlyValues) : 0,
    };
  }, [result.monthlyRor]);

  const rebalanceFrequencyLabel = useMemo(() => {
    const frequency = result.portfolioInput.rebalanceFrequency ?? "DAILY";
    return REBALANCE_FREQUENCY_LABELS[frequency];
  }, [result.portfolioInput.rebalanceFrequency]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedData = sessionStorage.getItem(STORAGE_KEYS.UPDATED_PORTFOLIO_DATA);

    if (!storedData) {
      setIsUpdateMode(false);
      setUpdatedPortfolioData(null);
      return;
    }

    try {
      const parsedData: UpdatedPortfolioData = JSON.parse(storedData);
      setUpdatedPortfolioData(parsedData);
      setIsUpdateMode(true);
    } catch (error) {
      console.error("Failed to parse updatedPortfolioData from sessionStorage:", error);
      sessionStorage.removeItem(STORAGE_KEYS.UPDATED_PORTFOLIO_DATA);
    }
  }, []);

  const handleConfirmAction = useCallback(
    async (modalData: SaveUpdateData) => {
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return Promise.reject("로그인이 필요합니다.");
      }

      setIsProcessing(true);

      try {
        let requestBody;
        let apiUrl;
        let method;

        if (isUpdateMode && updatedPortfolioData) {
          method = "PUT";
          apiUrl = `${API_BASE_URL}/portfolios/${updatedPortfolioData.id}`;
          requestBody = {
            ...updatedPortfolioData,
            name: modalData.name,
            description: modalData.description,
            ror: result.totalRor,
            volatility: result.volatility || 0,
            price: result.totalAmount,
            portfolioItemRequestDTOList: updatedPortfolioData.portfolioItemRequestDTOList,
          };
        } else {
          method = "POST";
          apiUrl = `${API_BASE_URL}/portfolios`;
          const portfolioItemRequestDTOList = result.portfolioInput.portfolioBacktestRequestItemDTOList.map(
            (item: InputPortfolioItem) => {
              if (item.customStockName && item.annualReturnRate !== undefined) {
                return {
                  stockId: null,
                  weight: normalizeWeight(item.weight),
                };
              }

              return {
                stockId: item.stockId,
                weight: normalizeWeight(item.weight),
              };
            }
          );

          requestBody = {
            name: modalData.name,
            description: modalData.description,
            amount: result.portfolioInput.amount,
            startDate: result.portfolioInput.startDate,
            endDate: result.portfolioInput.endDate,
            ror: result.totalRor,
            volatility: result.volatility || 0,
            price: result.totalAmount,
            portfolioItemRequestDTOList,
          };
        }

        const response = await fetch(apiUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            accept: "*/*",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `${isUpdateMode ? "수정" : "저장"} 실패: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`
          );
        }

        showToast(`포트폴리오가 성공적으로 ${isUpdateMode ? "수정" : "저장"}되었습니다.`, "success");
        setIsModalOpen(false);

        if (isUpdateMode) {
          sessionStorage.removeItem(STORAGE_KEYS.UPDATED_PORTFOLIO_DATA);
          sessionStorage.removeItem(STORAGE_KEYS.BACKTEST_RESULT);
          router.push("/portfolio");
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.BACKTEST_RESULT);
          router.push("/portfolio");
        }

        return Promise.resolve();
      } catch (error: unknown) {
        console.error(`${isUpdateMode ? "수정" : "저장"} 오류:`, error);
        const message = error instanceof Error ? error.message : "알 수 없는 오류";
        showToast(`${isUpdateMode ? "수정" : "저장"} 중 오류가 발생했습니다: ${message}`, "error");
        return Promise.reject(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [accessToken, isUpdateMode, normalizeWeight, result, router, showToast, updatedPortfolioData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HeaderSection
          isAuthenticated={Boolean(isAuthenticated)}
          isUpdateMode={isUpdateMode}
          isProcessing={isProcessing}
          rebalanceFrequencyLabel={rebalanceFrequencyLabel}
          onOpenModal={() => setIsModalOpen(true)}
        />

        <KpiCards
          totalRor={result.totalRor}
          highestMonthlyRor={highestMonthlyRor}
          lowestMonthlyRor={lowestMonthlyRor}
          totalAmount={result.totalAmount}
        />

        <PortfolioCompositionSection
          portfolioData={portfolioData}
          topPortfolioData={topPortfolioData}
          displayPortfolioData={displayPortfolioData}
          compositionSort={compositionSort}
          onSortChange={setCompositionSort}
        />

        <PerformanceTrackingSection
          latestCumulativeReturn={latestCumulativeReturn}
          normalizedMaxDrawdown={normalizedMaxDrawdown}
          winningRate={winningRate}
          performanceChartData={performanceChartData}
          drawdownDomainMin={drawdownDomainMin}
        />

        <DetailedAnalysisSection
          monthlyPerformanceData={monthlyPerformanceData}
          portfolioItems={result.portfolioBacktestResponseItemDTOList as PortfolioPerformanceItem[]}
        />

        <SaveUpdateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAction}
          isLoading={isProcessing}
          isUpdateMode={isUpdateMode}
          initialName={isUpdateMode ? updatedPortfolioData?.name : ""}
          initialDescription={isUpdateMode ? updatedPortfolioData?.description : ""}
        />

        <ToastNotification
          toast={toast}
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />
      </div>
    </div>
  );
};

export default BacktestResult;
