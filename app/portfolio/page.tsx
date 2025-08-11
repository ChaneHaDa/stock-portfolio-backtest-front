"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiCall, ApiError } from "@/utils/api";
import { Portfolio } from "@/types/portfolio";
import { formatPercentage, formatCurrency } from "@/utils/formatters";


export default function MyPortfolio() {
  const { accessToken } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    if (!accessToken) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await authenticatedApiCall<Portfolio[]>("/portfolios", accessToken);
      
      if (response.status === "success") {
        setPortfolios(response.data || []);
      } else {
        setError(response.message || "데이터를 불러오는 데 실패했습니다.");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setPortfolios([]);
      } else {
        setError(err instanceof Error ? err.message : "API 호출 중 오류가 발생했습니다.");
        console.error("Error fetching portfolios:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("정말로 이 포트폴리오를 삭제하시겠습니까?") || !accessToken) {
      return;
    }

    try {
      await authenticatedApiCall(`/portfolios/${id}`, accessToken, {
        method: "DELETE",
      });

      setPortfolios((prevPortfolios) =>
        prevPortfolios.filter((portfolio) => portfolio.id !== id)
      );
      alert("포트폴리오가 성공적으로 삭제되었습니다.");

    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        console.warn(`Portfolio with id ${id} not found, possibly already deleted.`);
        setPortfolios((prevPortfolios) =>
          prevPortfolios.filter((portfolio) => portfolio.id !== id)
        );
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : "포트폴리오 삭제 중 오류가 발생했습니다.";
      setError(errorMessage);
      alert("포트폴리오 삭제에 실패했습니다.");
      console.error("Error deleting portfolio:", err);
    }
  }, [accessToken]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-primary-50 to-white">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-lg text-secondary-700">포트폴리오를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-primary-50 to-white">
        <p className="text-red-500 bg-white p-4 rounded-lg shadow-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8">
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-8 text-secondary-800">내 포트폴리오</h1>
      
        {portfolios.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-100">
            <p className="text-center text-secondary-600">등록된 포트폴리오가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-w-[1200px]">
            <table className="w-full bg-white border border-primary-200 rounded-lg shadow-lg">
              <thead className="bg-primary-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">이름</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">설명</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">투자 금액</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">현재 가치</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">수익률</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">변동성</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">운용 기간</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200">
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className="hover:bg-primary-50 transition-colors">
                  {/* 포트폴리오 이름을 Link로 감싸기 */}
                  <td className="py-4 px-4 whitespace-nowrap font-medium">
                    <Link href={`/portfolio/${portfolio.id}`} className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                      {portfolio.name}
                    </Link>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-secondary-600">{portfolio.description}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{formatCurrency(portfolio.amount)}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{formatCurrency(portfolio.price)}</td>
                  <td className={`py-4 px-4 whitespace-nowrap font-medium ${portfolio.ror >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatPercentage(portfolio.ror)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{portfolio.volatility.toFixed(2)}%</td>
                  <td className="py-4 px-4 whitespace-nowrap text-secondary-600">
                    {portfolio.startDate} ~ {portfolio.endDate}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors duration-200"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
