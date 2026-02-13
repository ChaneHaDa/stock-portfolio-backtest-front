// app/portfolio/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8">
      <div className="mx-auto w-full max-w-[960px] px-4">
        <div className="w-full rounded-xl border border-primary-200 bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 border-b-2 border-primary-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-secondary-800">
            {portfolio.name} {/* 항상 텍스트로 표시 */}
          </h1>
          {/* 수정 버튼 대신 "백테스트 및 수정" 버튼 추가 */}
          <Link
            href={`/portfolio/${id}/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-700"
          >
            백테스트 및 수정
          </Link>
        </div>

        {/* 기본 정보 섹션 (수정 관련 로직 제거) */}
        <div className="mb-8 rounded-xl bg-primary-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-secondary-700">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block font-medium text-secondary-700">설명</label>
              <p className="text-secondary-800">{portfolio.description || "-"}</p>
            </div>
             <div>
              <label className="mb-1 block font-medium text-secondary-700">초기 투자 금액</label>
              <p className="text-secondary-800">{formatAmount(portfolio.amount)}</p>
            </div>
            <div>
              <label className="mb-1 block font-medium text-secondary-700">현재 가치</label>
              <p className="text-secondary-800">{formatAmount(portfolio.price)}</p>
            </div>
            <div>
              <label className="mb-1 block font-medium text-secondary-700">수익률</label>
              <p className={`font-medium ${portfolio.ror >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatRor(portfolio.ror)}
              </p>
            </div>
            <div>
              <label className="mb-1 block font-medium text-secondary-700">변동성</label>
              <p className="text-secondary-800">{portfolio.volatility.toFixed(2)}%</p>
            </div>
            <div>
              <label className="mb-1 block font-medium text-secondary-700">운용 기간</label>
              <p className="text-secondary-800">{portfolio.startDate} ~ {portfolio.endDate}</p>
            </div>
          </div>
        </div>

        {/* 포트폴리오 구성 종목 섹션 (수정 관련 로직 제거) */}
        <div className="rounded-xl bg-primary-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-secondary-700">포트폴리오 구성</h2>
          {portfolio.items && portfolio.items.length > 0 ? (
            <div className="space-y-3">
              <div className="space-y-3 md:hidden">
                {portfolio.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-primary-100 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-xs text-secondary-500">종목명</p>
                    <p className="font-medium text-secondary-800">{item.name}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-secondary-500">비중</p>
                      <p className="font-semibold text-secondary-700">{`${(item.weight * 100).toFixed(2)}%`}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full rounded-lg border border-primary-100 bg-white shadow-sm">
                  <thead className="bg-primary-100/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-600">종목명</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary-600">비중</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {portfolio.items.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-primary-50">
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-secondary-800">{item.name}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-secondary-700">{`${(item.weight * 100).toFixed(2)}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-secondary-500">포함된 종목 정보가 없습니다.</p>
          )}
        </div>
      </div>
      {/* StockSearchModal 제거 */}
    </div>
    </div>
  );
}
