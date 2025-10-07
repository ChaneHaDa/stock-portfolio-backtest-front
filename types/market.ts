export interface MarketIndex {
  price: string;
  change: string;
}

export interface MarketTrend {
  trend: string;
  description: string;
  indices: {
    spy: MarketIndex;
    qqq: MarketIndex;
    dia: MarketIndex;
  };
}

export interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}