"use client";

import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const BacktestResult = ({ result }: { result: any }) => {
  // 데이터 가공 함수
  const processMonthlyData = (rorObject: { [key: string]: number }) => {
    return Object.entries(rorObject)
      .map(([date, value]) => ({
        date: date.slice(0, 7),
        return: Number(value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // 공통 스타일 클래스
  const sectionStyle = "bg-white rounded-lg shadow p-6 mb-6";
  const headingStyle = "text-2xl font-bold mb-4 text-gray-800";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 섹션 */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">백테스트 결과 분석</h1>
        <Link
          href="/backtest"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← 새 백테스트 실행
        </Link>
      </div>

      {/* 총 수익률 섹션 */}
      <div className={`${sectionStyle} bg-gradient-to-r from-blue-50 to-indigo-50`}>
        <h2 className={headingStyle}>포트폴리오 성능 요약</h2>
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-bold text-blue-600">
            {formatPercentage(result.totalRor)}
          </span>
          <span className="text-gray-600">누적 수익률</span>
        </div>
      </div>

      {/* 수익률 차트 섹션 */}
      <div className={sectionStyle}>
        <h2 className={headingStyle}>월별 수익률 추이</h2>
        {/* 차트가 좌우로 잘리지 않도록, overflow-x-auto + ResponsiveContainer에 충분한 width 설정 */}
        <div className="h-96 overflow-x-auto">
          <ResponsiveContainer width="150%" height="100%">
            <LineChart
              data={processMonthlyData(result.monthlyRor)}
              margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280' }}
                interval={0} // 모든 라벨 표시
                angle={-45} // 라벨 기울이기
                dy={20}      // 라벨 위치 조정
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                width={80}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [
                  <span key="value" className="text-blue-600 font-semibold">
                    {value.toFixed(2)}%
                  </span>,
                  '수익률',
                ]}
                labelFormatter={(label) => (
                  <span className="text-gray-600">{label}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="return"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 상세 성과 테이블 섹션 */}
      <div className={sectionStyle}>
        <h2 className={headingStyle}>상세 성과 분석</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* 포트폴리오 월별 수익률 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">포트폴리오 월별 성과</h3>
            {/* 세로 스크롤을 통해 긴 데이터를 가독성 있게 표시 */}
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">월</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">수익률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processMonthlyData(result.monthlyRor).map(({ date, return: ror }) => (
                    <tr key={date}>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{date}</td>
                      <td
                        className={`px-4 py-3 text-right whitespace-nowrap ${
                          ror >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(ror)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 개별 종목 성과 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">개별 종목 성과</h3>
            <div className="space-y-4">
              {result.portfolioResponseItemDTOS.map((stock: any) => (
                <div key={stock.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{stock.name}</span>
                    <span
                      className={`text-sm ${
                        stock.totalRor >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(stock.totalRor)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    최대 수익률: {formatPercentage(
                      Math.max(...Object.values<number>(stock.monthlyRor))
                    )}
                    <br />
                    최대 손실: {formatPercentage(
                      Math.min(...Object.values<number>(stock.monthlyRor))
                    )}
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

// 퍼센트 포맷팅 유틸리티 함수
const formatPercentage = (value: number) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export default BacktestResult;
