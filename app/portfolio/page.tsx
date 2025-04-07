"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; // Link 임포트 추가
import { API_BASE_URL } from "@/config/apiConfig";

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
        const response = await fetch(API_BASE_URL+"/portfolios", {
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

  // 포트폴리오 삭제 함수
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 포트폴리오를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        // 404는 이미 삭제된 경우일 수 있으므로 성공으로 간주하거나 특정 메시지 표시
        if (response.status === 404) {
           console.warn(`Portfolio with id ${id} not found, possibly already deleted.`);
           // 화면에서 제거
           setPortfolios((prevPortfolios) =>
             prevPortfolios.filter((portfolio) => portfolio.id !== id)
           );
           return;
        }
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      // 성공적으로 삭제된 경우, 상태 업데이트하여 화면에서 제거
      setPortfolios((prevPortfolios) =>
        prevPortfolios.filter((portfolio) => portfolio.id !== id)
      );
      alert("포트폴리오가 성공적으로 삭제되었습니다.");

    } catch (err) {
      setError("포트폴리오 삭제 중 오류가 발생했습니다.");
      console.error("Error deleting portfolio:", err);
      alert("포트폴리오 삭제에 실패했습니다."); // 사용자에게 실패 알림
    }
  };

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
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className="hover:bg-gray-50 transition-colors">
                  {/* 포트폴리오 이름을 Link로 감싸기 */}
                  <td className="py-4 px-4 whitespace-nowrap font-medium">
                    <Link href={`/portfolio/${portfolio.id}`} className="text-blue-600 hover:underline">
                      {portfolio.name}
                    </Link>
                  </td>
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
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
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
  );
}
