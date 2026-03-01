export interface Portfolio {
  id: number;
  name: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  ror: number;
  volatility: number;
  price: number;
}

export interface PortfolioItem {
  stockId: number | null;
  stockName: string;
  weight: number | string;
}

export interface PortfolioItemRequest {
  stockId: number;
  weight: number;
}

export interface CreatePortfolioRequest {
  name: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  ror: number;
  volatility: number;
  price: number;
  portfolioItemRequestDTOList: PortfolioItemRequest[];
}

export interface UpdatePortfolioRequest extends CreatePortfolioRequest {
  id: number;
}

export interface Stock {
  stockId: number;
  name: string;
  shortCode: string;
  marketCategory: string;
}

export type RebalanceFrequency = "NONE" | "DAILY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface BacktestRequest {
  startDate: string;
  endDate: string;
  amount: number;
  rebalanceFrequency: RebalanceFrequency;
  portfolioBacktestRequestItemDTOList: PortfolioItem[];
}

export interface BacktestResult {
  totalRor: number;
  totalAmount: number;
  volatility: number;
  monthlyRor: Record<string, number>;
  portfolioInput: {
    startDate: string;
    endDate: string;
    amount: number;
    rebalanceFrequency?: RebalanceFrequency;
    portfolioBacktestRequestItemDTOList: PortfolioItem[];
  };
  portfolioBacktestResponseItemDTOList: Array<{
    name: string;
    totalRor: number;
    monthlyRor: Record<string, number>;
  }>;
}

export interface MonthlyData {
  date: string;
  return: number;
}

export interface ChartData {
  name: string;
  value: number;
}
