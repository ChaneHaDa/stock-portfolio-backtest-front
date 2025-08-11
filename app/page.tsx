"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MarketTrend, AlphaVantageGlobalQuote } from '@/types/market';
import { INVESTMENT_TIPS } from '@/utils/constants';
import { getAlphaVantageKey } from '@/utils/env';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [investmentTip, setInvestmentTip] = useState('');
  const [marketTrend, setMarketTrend] = useState<MarketTrend>({
    trend: '로딩 중...',
    description: '',
    indices: {
      spy: { price: '로딩 중...', change: '0%' },
      qqq: { price: '로딩 중...', change: '0%' },
      dia: { price: '로딩 중...', change: '0%' }
    }
  });
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);


  const fetchIndexData = useCallback(async (symbol: string) => {
    const API_KEY = getAlphaVantageKey();
    if (!API_KEY) {
      console.error('Alpha Vantage API key not found');
      return null;
    }

    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
      const data: AlphaVantageGlobalQuote = await response.json();
      
      if (data['Global Quote']) {
        return {
          price: parseFloat(data['Global Quote']['05. price']).toFixed(2),
          change: data['Global Quote']['10. change percent']
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error);
      return null;
    }
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      setIsLoadingMarket(true);
      const [spyData, qqqData, diaData] = await Promise.all([
        fetchIndexData('SPY'),
        fetchIndexData('QQQ'),
        fetchIndexData('DIA')
      ]);

      if (spyData && qqqData && diaData) {
        const spyChange = parseFloat(spyData.change.replace('%', ''));
        let trend = '';
        let description = '';
        
        if (spyChange > 1) {
          trend = '강세장';
          description = '시장이 상승 추세를 보이고 있습니다.';
        } else if (spyChange < -1) {
          trend = '약세장';
          description = '시장이 하락 추세를 보이고 있습니다.';
        } else {
          trend = '보합장';
          description = '시장이 안정적인 상태를 유지하고 있습니다.';
        }
        
        setMarketTrend({
          trend,
          description,
          indices: {
            spy: spyData,
            qqq: qqqData,
            dia: diaData
          }
        });
      } else {
        throw new Error('Market data unavailable');
      }
    } catch (error) {
      console.error('Market data fetch error:', error);
      setMarketTrend({
        trend: '데이터를 가져오지 못했습니다',
        description: '잠시 후 다시 시도해주세요.',
        indices: {
          spy: { price: 'N/A', change: 'N/A' },
          qqq: { price: 'N/A', change: 'N/A' },
          dia: { price: 'N/A', change: 'N/A' }
        }
      });
    } finally {
      setIsLoadingMarket(false);
    }
  }, [fetchIndexData]);

  useEffect(() => {
    // 투자 팁 설정
    setInvestmentTip(INVESTMENT_TIPS[Math.floor(Math.random() * INVESTMENT_TIPS.length)]);

    // 시장 데이터 가져오기
    fetchMarketData();
  }, [fetchMarketData]);

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-primary-50 to-white min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-800 mb-4">나만의 투자 포트폴리오 관리</h1>
        <p className="text-lg text-secondary-600">
          포트폴리오를 구성하고 백테스팅을 통해 전략을 검증해보세요.
        </p>
      </div>

      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg text-center mb-12 border border-primary-100">
        <h2 className="text-3xl font-bold text-secondary-800 mb-4">오늘의 투자 팁</h2>
        <p className="text-xl text-primary-600 italic font-medium">&ldquo;{investmentTip}&rdquo;</p>
      </div>

      <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-lg text-center mb-12 border border-primary-200">
        <h2 className="text-3xl font-bold text-secondary-800 mb-4">현재 시장 동향</h2>
        {isLoadingMarket ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-secondary-600">시장 데이터를 불러오는 중...</span>
          </div>
        ) : (
          <>
            <p className="text-2xl font-semibold text-primary-600 mb-2">{marketTrend.trend}</p>
            <p className="text-lg text-secondary-600 mb-6">{marketTrend.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <h3 className="font-semibold text-lg mb-3 text-secondary-700 h-14 flex items-center justify-center text-center">S&P 500<br />(SPY)</h3>
            <p className="text-2xl font-bold text-secondary-800 mb-2">${marketTrend.indices.spy.price}</p>
            <p className={`text-lg font-medium ${parseFloat(marketTrend.indices.spy.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketTrend.indices.spy.change}
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <h3 className="font-semibold text-lg mb-3 text-secondary-700 h-14 flex items-center justify-center text-center">NASDAQ 100<br />(QQQ)</h3>
            <p className="text-2xl font-bold text-secondary-800 mb-2">${marketTrend.indices.qqq.price}</p>
            <p className={`text-lg font-medium ${parseFloat(marketTrend.indices.qqq.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketTrend.indices.qqq.change}
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <h3 className="font-semibold text-lg mb-3 text-secondary-700 h-14 flex items-center justify-center text-center">다우존스<br />(DIA)</h3>
            <p className="text-2xl font-bold text-secondary-800 mb-2">${marketTrend.indices.dia.price}</p>
            <p className={`text-lg font-medium ${parseFloat(marketTrend.indices.dia.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketTrend.indices.dia.change}
            </p>
          </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isAuthenticated ? (
          // 로그인 상태일 때: 포트폴리오 관리 + 백테스팅
          <>
            <Link href="/portfolio">
              <div className="block p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">포트폴리오 관리</h3>
                <p className="text-primary-100">나만의 투자 포트폴리오를 생성하고 관리하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="block p-8 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">백테스팅</h3>
                <p className="text-secondary-200">과거 데이터를 기반으로 투자 전략의 성과를 분석하세요.</p>
              </div>
            </Link>
          </>
        ) : (
          // 로그아웃 상태일 때: 회원가입 + 백테스팅
          <>
            <Link href="/register">
              <div className="block p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">회원가입</h3>
                <p className="text-primary-100">지금 가입하고 포트폴리오 관리를 시작하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="block p-8 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">백테스팅 체험</h3>
                <p className="text-secondary-200">로그인 없이 백테스팅 기능을 체험해보세요.</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
