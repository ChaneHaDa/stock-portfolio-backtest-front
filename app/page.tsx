"use client"; // 클라이언트 컴포넌트로 변경
import React, { useState, useEffect } from 'react'; // useState, useEffect 임포트
import Link from 'next/link';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [investmentTip, setInvestmentTip] = useState('');
  const [marketTrend, setMarketTrend] = useState({
    trend: '로딩 중...',
    description: '',
    indices: {
      spy: { price: '로딩 중...', change: '0%' },
      qqq: { price: '로딩 중...', change: '0%' },
      dia: { price: '로딩 중...', change: '0%' }
    }
  });

  useEffect(() => {
    // localStorage에서 토큰 확인
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);

    // 투자 팁 설정
    const tips = [
      "장기 투자는 단기 투자보다 안정적인 수익을 제공할 수 있습니다.",
      "분산 투자는 포트폴리오의 리스크를 줄이는 좋은 방법입니다.",
      "투자 전 반드시 기업의 재무제표를 분석하세요.",
      "감정에 휘둘리지 말고 투자 전략을 꾸준히 유지하세요.",
      "정기적인 포트폴리오 리밸런싱이 중요합니다."
    ];
    setInvestmentTip(tips[Math.floor(Math.random() * tips.length)]);

    // Alpha Vantage API를 사용하여 시장 동향 가져오기
    const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    
    // 여러 지수의 데이터를 가져오는 함수
    const fetchIndexData = async (symbol: string) => {
      try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
        const data = await response.json();
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
    };

    // 모든 지수 데이터 가져오기
    Promise.all([
      fetchIndexData('SPY'),
      fetchIndexData('QQQ'),
      fetchIndexData('DIA')
    ]).then(([spyData, qqqData, diaData]) => {
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
      }
    }).catch(() => {
      setMarketTrend({
        trend: '데이터를 가져오지 못했습니다',
        description: '잠시 후 다시 시도해주세요.',
        indices: {
          spy: { price: 'N/A', change: 'N/A' },
          qqq: { price: 'N/A', change: 'N/A' },
          dia: { price: 'N/A', change: 'N/A' }
        }
      });
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">나만의 투자 포트폴리오 관리</h1>
        <p className="text-lg text-gray-600">
          포트폴리오를 구성하고 백테스팅을 통해 전략을 검증해보세요.
        </p>
      </div>

      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-md text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">오늘의 투자 팁</h2>
        <p className="text-xl text-blue-600 italic">"{investmentTip}"</p>
      </div>

      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg text-center mb-12 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">현재 시장 동향</h2>
        <p className="text-2xl font-semibold text-indigo-600 mb-2">{marketTrend.trend}</p>
        <p className="text-lg text-gray-600 mb-6">{marketTrend.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">S&P 500 (SPY)</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">${marketTrend.indices.spy.price}</p>
            <p className={`text-lg font-medium ${parseFloat(marketTrend.indices.spy.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketTrend.indices.spy.change}
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">NASDAQ 100 (QQQ)</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">${marketTrend.indices.qqq.price}</p>
            <p className={`text-lg font-medium ${parseFloat(marketTrend.indices.qqq.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketTrend.indices.qqq.change}
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">다우존스 (DIA)</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">${marketTrend.indices.dia.price}</p>
            <p className={`text-lg font-medium ${parseFloat(marketTrend.indices.dia.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {marketTrend.indices.dia.change}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isAuthenticated ? (
          // 로그인 상태일 때: 포트폴리오 관리 + 백테스팅
          <>
            <Link href="/portfolio">
              <div className="block p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">포트폴리오 관리</h3>
                <p className="text-indigo-100">나만의 투자 포트폴리오를 생성하고 관리하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="block p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">백테스팅</h3>
                <p className="text-emerald-100">과거 데이터를 기반으로 투자 전략의 성과를 분석하세요.</p>
              </div>
            </Link>
          </>
        ) : (
          // 로그아웃 상태일 때: 회원가입 + 백테스팅
          <>
            <Link href="/register">
              <div className="block p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">회원가입</h3>
                <p className="text-indigo-100">지금 가입하고 포트폴리오 관리를 시작하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="block p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">백테스팅 체험</h3>
                <p className="text-emerald-100">로그인 없이 백테스팅 기능을 체험해보세요.</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
