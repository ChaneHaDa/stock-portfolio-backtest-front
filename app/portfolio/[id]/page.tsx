// app/portfolio/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link'; // Link 컴포넌트 추가
import { API_BASE_URL } from "@/config/apiConfig";

// 상세 포트폴리오 데이터 타입 정의
interface PortfolioItem {
  id: number;
  stockId: number;
  name: string;
  weight: number;
}

interface PortfolioDetail {
  id: number;
  name: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  ror: number;
  volatility: number;
  price: number;
  items: PortfolioItem[];
}

// API 응답 타입 정의
interface DetailApiResponse {
  status: string;
  code: string | null;
  message: string | null;
  data: PortfolioDetail;
}

export default function PortfolioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // URL에서 id 파라미터 추출

  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [isEditing, setIsEditing] = useState<boolean>(false); // 수정 모드 상태 제거

  useEffect(() => {
    if (!id || Array.isArray(id)) {
      setError("포트폴리오 ID가 유효하지 않습니다.");
      setLoading(false);
      return;
    }

    const fetchPortfolioDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("포트폴리오를 찾을 수 없습니다.");
          } else {
             throw new Error(`API 요청 실패: ${response.status}`);
          }
          setPortfolio(null); // 데이터를 찾지 못했으므로 null 처리
        } else {
          const responseData: DetailApiResponse = await response.json();
          if (responseData.status === "success" && responseData.data) {
            setPortfolio(responseData.data);
          } else {
            setError(responseData.message || "데이터를 불러오는 데 실패했습니다.");
            setPortfolio(null);
          }
        }
      } catch (err) {
        setError("API 호출 중 오류가 발생했습니다.");
        console.error("Error fetching portfolio detail:", err);
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioDetail();
  }, [id]);

  // 수정 핸들러 제거
  // const handleUpdate = async () => { ... };

  // 금액 포맷팅 함수
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
  };

  // 수익률 포맷팅 함수
  const formatRor = (ror: number): string => {
    return `${ror.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">포트폴리오 정보를 불러오는 중입니다...</p>
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

  if (!portfolio) {
     return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">포트폴리오 정보를 표시할 수 없습니다.</p>
      </div>
    );
  }

  // 상세 정보 렌더링 (app/backtest/page.tsx와 유사한 구조 활용)
  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-[960px] mx-auto">
        <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            {portfolio.name} {/* 항상 텍스트로 표시 */}
          </h1>
          {/* 수정 버튼 대신 "백테스트 및 수정" 버튼 추가 */}
          <Link href={`/portfolio/${id}/edit`} passHref>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              백테스트 및 수정
            </button>
          </Link>
        </div>

        {/* 기본 정보 섹션 (수정 관련 로직 제거) */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">설명</label>
              <p className="text-gray-800">{portfolio.description || "-"}</p>
            </div>
             <div>
              <label className="block text-gray-700 font-medium mb-1">초기 투자 금액</label>
              <p className="text-gray-800">{formatAmount(portfolio.amount)}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">현재 가치</label>
              <p className="text-gray-800">{formatAmount(portfolio.price)}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">수익률</label>
              <p className={`font-medium ${portfolio.ror >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatRor(portfolio.ror)}
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">변동성</label>
              <p className="text-gray-800">{portfolio.volatility.toFixed(2)}%</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">운용 기간</label>
              <p className="text-gray-800">{portfolio.startDate} ~ {portfolio.endDate}</p>
            </div>
          </div>
        </div>

        {/* 포트폴리오 구성 종목 섹션 (수정 관련 로직 제거) */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">포트폴리오 구성</h2>
          {portfolio.items && portfolio.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">종목명</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">비중</th>
                    {/* 작업 컬럼 제거 */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.items.map((item) => ( // index 제거
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap font-medium">
                        {item.name} {/* 항상 텍스트로 표시 */}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        {`${(item.weight * 100).toFixed(2)}%`} {/* 항상 백분율로 표시 */}
                      </td>
                      {/* 작업 셀 제거 */}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 종목 추가 버튼 제거 */}
            </div>
          ) : (
            <p className="text-center text-gray-500">포함된 종목 정보가 없습니다.</p>
          )}
        </div>
      </div>
      {/* StockSearchModal 제거 */}
    </div>
  );
}
