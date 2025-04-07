// app/portfolio/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig"; // 경로 수정: ../../config -> @/config

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
  const [isEditing, setIsEditing] = useState<boolean>(false); // 수정 모드 상태

  useEffect(() => {
    if (!id || Array.isArray(id)) { // id가 배열인 경우도 처리
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

  // 수정 핸들러 (추후 구현)
  const handleUpdate = async () => {
    // TODO: 수정 API 호출 로직 구현
    alert("수정 기능은 아직 구현되지 않았습니다.");
    setIsEditing(false); // 수정 완료 후 보기 모드로 전환
  };

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
            {isEditing ? (
              <input
                type="text"
                value={portfolio.name} // 수정 가능한 입력 필드
                onChange={(e) => setPortfolio({ ...portfolio, name: e.target.value })}
                className="border border-gray-300 rounded-lg p-2"
              />
            ) : (
              portfolio.name // 보기 모드에서는 텍스트로 표시
            )}
          </h1>
          {isEditing ? (
             <div>
               <button
                 onClick={handleUpdate}
                 className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
               >
                 저장
               </button>
               <button
                 onClick={() => setIsEditing(false)} // 수정 취소
                 className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
               >
                 취소
               </button>
             </div>
           ) : (
             <button
               onClick={() => setIsEditing(true)} // 수정 모드 진입
               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
             >
               수정
             </button>
           )}
        </div>

        {/* 기본 정보 섹션 */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">설명</label>
              {isEditing ? (
                <textarea
                  value={portfolio.description}
                  onChange={(e) => setPortfolio({ ...portfolio, description: e.target.value })}
                  className="border border-gray-300 rounded-lg p-2 w-full h-24"
                />
              ) : (
                <p className="text-gray-800">{portfolio.description || "-"}</p>
              )}
            </div>
             <div>
              <label className="block text-gray-700 font-medium mb-1">초기 투자 금액</label>
              {isEditing ? (
                 <input
                   type="number"
                   value={portfolio.amount}
                   onChange={(e) => setPortfolio({ ...portfolio, amount: Number(e.target.value) })}
                   className="border border-gray-300 rounded-lg p-2 w-full"
                 />
               ) : (
                 <p className="text-gray-800">{formatAmount(portfolio.amount)}</p>
               )}
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
              {isEditing ? (
                <div className="flex space-x-2">
                   <input
                     type="date"
                     value={portfolio.startDate}
                     onChange={(e) => setPortfolio({ ...portfolio, startDate: e.target.value })}
                     className="border border-gray-300 rounded-lg p-2 w-full"
                   />
                   <input
                     type="date"
                     value={portfolio.endDate}
                     onChange={(e) => setPortfolio({ ...portfolio, endDate: e.target.value })}
                     className="border border-gray-300 rounded-lg p-2 w-full"
                   />
                </div>
              ) : (
                 <p className="text-gray-800">{portfolio.startDate} ~ {portfolio.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* 포트폴리오 구성 종목 섹션 */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">포트폴리오 구성</h2>
          {portfolio.items && portfolio.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">종목명</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">비중</th>
                    {/* 수정 모드일 때 작업 컬럼 추가 */}
                    {isEditing && <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">작업</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap font-medium">
                        {isEditing ? (
                           <input type="text" value={item.name} readOnly className="border border-gray-300 rounded-lg p-1 bg-gray-100 w-full" /> // 종목명은 수정 불가로 가정
                        ) : (
                           item.name
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.weight * 100} // API는 0~1, 표시는 0~100%
                            onChange={(e) => {
                              const newItems = [...portfolio.items];
                              newItems[index] = { ...newItems[index], weight: Number(e.target.value) / 100 };
                              setPortfolio({ ...portfolio, items: newItems });
                            }}
                            className="border border-gray-300 rounded-lg p-1 w-20 text-right"
                            step="0.01"
                            min="0"
                            max="100"
                          />
                        ) : (
                          `${(item.weight * 100).toFixed(2)}%` // 백분율로 표시
                        )}
                      </td>
                      {/* 수정 모드일 때 삭제 버튼 등 추가 */}
                      {isEditing && (
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                           <button className="text-red-500 hover:text-red-700 text-xs">삭제</button> {/* TODO: 삭제 로직 구현 */}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 수정 모드일 때 종목 추가 버튼 */}
              {isEditing && (
                 <div className="mt-4 text-center">
                   <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                     종목 추가 {/* TODO: 종목 추가 로직 구현 */}
                   </button>
                 </div>
               )}
            </div>
          ) : (
            <p className="text-center text-gray-500">포함된 종목 정보가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
