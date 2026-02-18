"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '@/config/apiConfig';
import { ApiResponse, Stock, StockPriceResponse, StockPrice } from '@/types/stock';

type Period = '1W' | '1M' | '3M' | '6M' | '1Y';

const StockDetailPage = () => {
  const params = useParams();
  const stockId = params.id as string;

  const [stock, setStock] = useState<Stock | null>(null);
  const [allPrices, setAllPrices] = useState<StockPrice[]>([]); // 전체 데이터
  const [displayPrices, setDisplayPrices] = useState<StockPrice[]>([]); // 화면에 표시할 데이터
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // 전체 데이터에서 기간에 따라 필터링
  const filterPricesByPeriod = (prices: StockPrice[], period: Period) => {
    if (prices.length === 0) return [];

    const latestDate = new Date(prices[prices.length - 1].baseDate);
    const startDate = new Date(latestDate);

    switch (period) {
      case '1W':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return prices.filter(price => new Date(price.baseDate) >= startDate);
  };

  // 주식 기본 정보 조회
  const fetchStockInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${stockId}`);
      const result: ApiResponse<Stock> = await response.json();

      if (result.status === 'success') {
        setStock(result.data);
      } else {
        alert('주식 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Stock info fetch error:', error);
      alert('주식 정보를 불러오는데 실패했습니다.');
    }
  }, [stockId]);

  // 주식 가격 정보 조회 (전체 데이터)
  const fetchStockPrices = useCallback(async () => {
    try {
      setIsPriceLoading(true);

      // 최신 데이터가 잘리지 않도록 최근 1000건을 먼저 조회
      const url = `${API_BASE_URL}/stocks/${stockId}/prices?page=0&size=1000&sort=baseDate&direction=DESC`;
      const response = await fetch(url);
      const result: ApiResponse<StockPriceResponse> = await response.json();

      if (result.status === 'success') {
        // 기존 화면 로직과 호환되도록 날짜 오름차순으로 재정렬
        const prices = [...result.data.content].sort((a, b) => a.baseDate.localeCompare(b.baseDate));
        setAllPrices(prices);
        setDisplayPrices(filterPricesByPeriod(prices, selectedPeriod));
      } else {
        console.error('API returned error:', result);
        alert('가격 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Stock price fetch error:', error);
      alert('가격 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsPriceLoading(false);
    }
  }, [stockId, selectedPeriod]);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchStockInfo();
      await fetchStockPrices();
      setIsLoading(false);
    };

    loadData();
  }, [fetchStockInfo, fetchStockPrices]);

  // 기간 변경 시 필터링만 수행
  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    setDisplayPrices(filterPricesByPeriod(allPrices, period));
  };

  // 등락률 계산 (전체 데이터 기준)
  const calculateChangeRate = () => {
    if (allPrices.length < 2) return { rate: 0, amount: 0 };

    const latestPrice = allPrices[allPrices.length - 1].closePrice;
    const previousPrice = allPrices[allPrices.length - 2].closePrice;
    const amount = latestPrice - previousPrice;
    const rate = (amount / previousPrice) * 100;

    return { rate, amount };
  };

  const changeInfo = calculateChangeRate();
  const latestPrice = allPrices.length > 0 ? allPrices[allPrices.length - 1] : null;

  // 차트 데이터 포맷 (표시할 데이터 기준)
  const chartData = displayPrices.map(price => ({
    date: price.baseDate,
    종가: price.closePrice,
    시가: price.openPrice,
    고가: price.highPrice,
    저가: price.lowPrice,
  }));

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-lg text-secondary-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="text-center">
            <p className="text-lg text-secondary-600">주식 정보를 찾을 수 없습니다.</p>
            <Link href="/stocks" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
              검색 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Link
          href="/stocks"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          검색으로 돌아가기
        </Link>
      </div>

      {/* 종목 기본 정보 */}
      <div className="panel p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-secondary-800 mb-2">{stock.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-lg text-secondary-600">종목코드: {stock.shortCode}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                stock.marketCategory === 'KOSPI'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {stock.marketCategory}
              </span>
            </div>
            <p className="text-sm text-secondary-500 mt-2">ISIN: {stock.isinCode}</p>
          </div>
        </div>

        {/* 현재 가격 정보 */}
        {latestPrice && (
          <>
            <div className="flex items-center gap-2 pt-4 pb-2 border-t border-gray-200">
              <p className="text-sm text-secondary-500">
                기준일: {latestPrice.baseDate}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-sm text-secondary-600 mb-1">현재가</p>
                <p className="text-2xl font-semibold text-secondary-800">
                  {latestPrice.closePrice.toLocaleString()}원
                </p>
                <div className={`mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium ${
                  changeInfo.rate >= 0 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <span>{changeInfo.rate >= 0 ? '상승' : '하락'}</span>
                  <span>
                    {changeInfo.rate >= 0 ? '+' : ''}{changeInfo.amount.toLocaleString()}원
                    ({changeInfo.rate >= 0 ? '+' : ''}{changeInfo.rate.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-secondary-600 mb-1">시가</p>
                <p className="text-lg font-semibold text-secondary-800">
                  {latestPrice.openPrice.toLocaleString()}원
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-secondary-600 mb-1">고가</p>
                <p className="text-lg font-semibold text-rose-600">
                  {latestPrice.highPrice.toLocaleString()}원
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-secondary-600 mb-1">저가</p>
                <p className="text-lg font-semibold text-blue-600">
                  {latestPrice.lowPrice.toLocaleString()}원
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-secondary-600 mb-1">거래량</p>
                <p className="text-lg font-semibold text-secondary-800">
                  {latestPrice.tradeQuantity.toLocaleString()}주
                </p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-1">
                <p className="text-sm text-secondary-600 mb-1">거래대금</p>
                <p className="text-lg font-semibold text-secondary-800">
                  {(latestPrice.tradeAmount / 1000000).toLocaleString()}백만원
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 가격 차트 */}
      <div className="panel p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-secondary-800">가격 차트</h2>

          {/* 기간 선택 버튼 */}
          <div className="flex flex-wrap gap-2">
            {(['1W', '1M', '3M', '6M', '1Y'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                disabled={isPriceLoading}
                className={`rounded-lg px-4 py-2 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-secondary-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {isPriceLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-lg text-secondary-600">차트 로딩 중...</span>
          </div>
        ) : displayPrices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-secondary-600">해당 기간의 가격 데이터가 없습니다.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toLocaleString()}원`, '']}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="종가"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="고가"
                stroke="#dc2626"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="저가"
                stroke="#2563eb"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
