"use client";
import { useEffect, useState } from "react";

// 포트폴리오 아이템의 타입 정의
interface Portfolio {
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

// API 응답 타입 정의
interface ApiResponse {
  status: string;
  code: string | null;
  message: string | null;
  data: Portfolio[];
}

export default function MyPortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        // localStorage에서 토큰 가져오기
        const token = localStorage.getItem("accessToken");
        const response = await fetch("http://localhost:8080/api/v1/portfolios", {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: token ? `Bearer ${token}` : "",
          }
        });

        // 404 응답은 데이터가 없는 것으로 간주
        if (response.status === 404) {
          setPortfolios([]);
          setLoading(false); // 로딩 상태 종료
          return; // 함수 종료
        }

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const responseData: ApiResponse = await response.json();

        if (responseData.status === "success") {
          setPortfolios(responseData.data);
        } else {
          setError("데이터를 불러오는 데 실패했습니다.");
        }
      } catch (err) {
        setError("API 호출 중 오류가 발생했습니다.");
        console.error("Error fetching portfolios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  // 수익률 포맷팅 함수
  const formatRor = (ror: number): string => {
    return `${ror.toFixed(2)}%`;
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">포트폴리오를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-center mb-6">내 포트폴리오</h1>
      
      {portfolios.length === 0 ? (
        <p className="text-center">등록된 포트폴리오가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto w-full max-w-[1200px]">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투자 금액</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 가치</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변동성</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">운용 기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 whitespace-nowrap font-medium">{portfolio.name}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-gray-600">{portfolio.description}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{formatAmount(portfolio.amount)}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{formatAmount(portfolio.price)}</td>
                  <td className={`py-4 px-4 whitespace-nowrap font-medium ${portfolio.ror >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatRor(portfolio.ror)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{portfolio.volatility.toFixed(2)}%</td>
                  <td className="py-4 px-4 whitespace-nowrap text-gray-600">
                    {portfolio.startDate} ~ {portfolio.endDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
