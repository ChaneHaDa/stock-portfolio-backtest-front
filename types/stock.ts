// 주식 관련 타입 정의

export interface Stock {
  id: number;
  name: string;
  shortCode: string;
  isinCode: string;
  marketCategory: 'KOSPI' | 'KOSDAQ';
}

export interface StockSearchResult {
  stockId: number;
  name: string;
  shortCode: string;
  marketCategory: 'KOSPI' | 'KOSDAQ';
}

export interface StockPrice {
  id: number;
  closePrice: number;
  openPrice: number;
  lowPrice: number;
  highPrice: number;
  tradeQuantity: number;
  tradeAmount: number;
  issuedCount: number;
  baseDate: string; // yyyy-MM-dd 형식
}

export interface StockPriceResponse {
  content: StockPrice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  status: string;
  code: string | null;
  message: string | null;
  data: T;
}