export const INVESTMENT_TIPS = [
  "장기 투자는 단기 투자보다 안정적인 수익을 제공할 수 있습니다.",
  "분산 투자는 포트폴리오의 리스크를 줄이는 좋은 방법입니다.",
  "투자 전 반드시 기업의 재무제표를 분석하세요.",
  "감정에 휘둘리지 말고 투자 전략을 꾸준히 유지하세요.",
  "정기적인 포트폴리오 리밸런싱이 중요합니다.",
] as const;

export const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28BFF",
  "#FF6384",
] as const;

export const DEFAULT_PORTFOLIO_ITEM = {
  stockId: 1,
  stockName: "삼성전자",
  weight: "1"
} as const;

export const MARKET_INDICES = {
  SPY: 'S&P 500 (SPY)',
  QQQ: 'NASDAQ 100 (QQQ)',
  DIA: '다우존스 (DIA)'
} as const;

export const API_ENDPOINTS = {
  PORTFOLIOS: '/portfolios',
  BACKTEST: '/portfolios/backtest',
  STOCKS: '/stocks',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  BACKTEST_RESULT: 'backtestResult',
  UPDATED_PORTFOLIO_DATA: 'updatedPortfolioData',
} as const;

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  WEIGHT_TOLERANCE: 0.0001,
  MIN_INVESTMENT_AMOUNT: 1,
  PORTFOLIO_WEIGHT_TOTAL: 100,
} as const;