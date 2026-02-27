import { ChartData, MonthlyData } from "@/types/portfolio";

export interface SaveUpdateData {
  name: string;
  description: string;
}

export interface UpdatedPortfolioData {
  id: number;
  name: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  portfolioItemRequestDTOList: Array<{ stockId: number | null; weight: number }>;
}

export interface InputPortfolioItem {
  stockId?: number | null;
  customStockName?: string;
  stockName?: string;
  annualReturnRate?: number;
  weight: number | string;
}

export interface PortfolioPerformanceItem {
  name?: string;
  customStockName?: string;
  totalRor: number;
  monthlyRor: Record<string, number>;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export interface CompositionItem extends ChartData {
  originalIndex: number;
}

export interface PerformanceChartPoint {
  date: string;
  monthlyReturn: number;
  cumulativeReturn: number;
  drawdown: number;
}

export type CompositionSort = "weightDesc" | "inputOrder";

export type { MonthlyData };
