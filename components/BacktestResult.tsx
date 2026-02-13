"use client";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedApiCall, ApiError } from "@/utils/api";
import { formatPercentage, formatCurrency } from "@/utils/formatters";
import { BacktestResult as BacktestResultType, ChartData, MonthlyData } from "@/types/portfolio";
import { CHART_COLORS, STORAGE_KEYS } from "@/utils/constants";
import { API_BASE_URL } from "@/config/apiConfig";

// 저장/수정 모달 Props
interface SaveUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: ({ name, description }: { name: string; description: string }) => Promise<void>; // 이름 변경: onSave -> onConfirm
  isLoading: boolean;
  isUpdateMode: boolean; // 수정 모드인지 여부 추가
  initialName?: string; // 수정 모드 시 초기 이름
  initialDescription?: string; // 수정 모드 시 초기 설명
}

// 저장/수정 시 필요한 데이터 인터페이스
interface SaveUpdateData {
  name: string;
  description: string;
}

// 기존 PortfolioItem 인터페이스 (백테스트 결과 저장 시 사용)
interface PortfolioItem {
  stockId: number;
  stockName: string;
  weight: number;
}

// 수정된 포트폴리오 데이터 인터페이스 (sessionStorage에서 로드)
interface UpdatedPortfolioData {
    id: number;
    name: string;
    description: string;
    amount: number;
    startDate: string;
    endDate: string;
    portfolioItemRequestDTOList: Array<{ stockId: number | null; weight: number }>;
}


// 저장/수정 모달 컴포넌트
const SaveUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isUpdateMode,
  initialName = "",
  initialDescription = ""
}: SaveUpdateModalProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [isOpen, initialName, initialDescription]);


  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    try {
      await onConfirm({ name, description }); // onConfirm 호출
    } catch (error) {
      // 에러 처리는 onConfirm 내부 또는 호출하는 곳에서 수행
      console.error("Save/Update Modal Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/80 backdrop-blur-md">
      <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-2xl w-full max-w-md p-8 m-4 border-2 border-primary-200 relative overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary-300/20 rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isUpdateMode ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200' : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-200'} shadow-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isUpdateMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                {isUpdateMode ? "포트폴리오 수정" : "백테스트 저장"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-all p-2 hover:bg-secondary-100/50 rounded-2xl group"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-bold text-secondary-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                포트폴리오 이름 <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 2025년 성장주 포트폴리오"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border-2 border-primary-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all placeholder:text-secondary-400"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-primary-400/5 to-primary-400/0 pointer-events-none"></div>
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="description" className="block text-sm font-bold text-secondary-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                설명 <span className="text-secondary-400 font-normal text-xs ml-2">(선택사항)</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="이 포트폴리오의 투자 전략이나 특징을 간단히 설명해주세요"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border-2 border-primary-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 h-24 resize-none transition-all placeholder:text-secondary-400"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-primary-400/5 to-primary-400/0 pointer-events-none"></div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-secondary-600 bg-white/80 backdrop-blur border-2 border-secondary-200 rounded-2xl hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200 font-semibold flex items-center gap-2 shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 text-white rounded-2xl transition-all duration-200 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isUpdateMode
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리 중...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isUpdateMode ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      )}
                    </svg>
                    {isUpdateMode ? "수정 완료" : "저장하기"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface BacktestResultProps {
  result: BacktestResultType;
}

const BacktestResult = ({ result }: BacktestResultProps) => {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  const processMonthlyData = useCallback((rorObject: Record<string, number>): MonthlyData[] => {
    return Object.entries(rorObject)
      .map(([date, value]) => ({
        date: date.slice(0, 7),
        return: Number(value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const processPortfolioData = useCallback((portfolio: any[]): ChartData[] => {
    return portfolio.map((item) => ({
      name: item.stockName || item.customStockName || "알 수 없음",
      value: item.weight * 100,
    }));
  }, []);


  const sectionStyle = "bg-white rounded-lg shadow p-6 mb-6";
  const headingStyle = "text-2xl font-bold mb-4 text-gray-800";

  const portfolioData = useMemo(() => 
    processPortfolioData(result.portfolioInput.portfolioBacktestRequestItemDTOList),
    [processPortfolioData, result.portfolioInput.portfolioBacktestRequestItemDTOList]
  );

  const totalPortfolioValue = useMemo(() => 
    portfolioData.reduce((acc, cur) => acc + cur.value, 0),
    [portfolioData]
  );

  const { highestMonthlyRor, lowestMonthlyRor } = useMemo(() => {
    const monthlyValues = Object.values(result.monthlyRor).map(Number);
    return {
      highestMonthlyRor: monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0,
      lowestMonthlyRor: monthlyValues.length > 0 ? Math.min(...monthlyValues) : 0,
    };
  }, [result.monthlyRor]);


  // 수정 모드 상태 (sessionStorage 확인)
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updatedPortfolioData, setUpdatedPortfolioData] = useState<UpdatedPortfolioData | null>(null);

  // 저장/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 저장/수정 진행 중 상태

  // 토스트 알림 상태
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // 토스트 표시 함수
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {

      // 수정 모드 데이터 확인
      const storedData = sessionStorage.getItem(STORAGE_KEYS.UPDATED_PORTFOLIO_DATA);
      if (storedData) {
        try {
          const parsedData: UpdatedPortfolioData = JSON.parse(storedData);
          setUpdatedPortfolioData(parsedData);
          setIsUpdateMode(true);
        } catch (e) {
          console.error("Failed to parse updatedPortfolioData from sessionStorage:", e);
          sessionStorage.removeItem(STORAGE_KEYS.UPDATED_PORTFOLIO_DATA); // 파싱 실패 시 제거
        }
      } else {
        setIsUpdateMode(false);
        setUpdatedPortfolioData(null);
      }
    }
  }, []);

  // 저장/수정 버튼 클릭 시 모달 열기
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달에서 확인 버튼 클릭 시 처리 (저장 또는 수정)
  const handleConfirmAction = async (modalData: SaveUpdateData) => {
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return Promise.reject("로그인이 필요합니다.");
    }

    setIsProcessing(true);

    try {
      let response;
      let requestBody;
      let apiUrl;
      let method;

      if (isUpdateMode && updatedPortfolioData) {
        // --- 수정 모드 (PUT 요청) ---
        method = 'PUT';
        apiUrl = `${API_BASE_URL}/portfolios/${updatedPortfolioData.id}`;
        requestBody = {
          ...updatedPortfolioData, // 기존 수정 데이터 (id, amount, startDate, endDate, items)
          name: modalData.name, // 모달에서 입력받은 이름
          description: modalData.description, // 모달에서 입력받은 설명
          // 백테스트 결과 반영
          ror: result.totalRor,
          volatility: result.volatility || 0,
          price: result.totalAmount,
          portfolioItemRequestDTOList: updatedPortfolioData.portfolioItemRequestDTOList // items 포함
        };
        // id는 requestBody에 포함하지 않음

      } else {
        // --- 저장 모드 (POST 요청) ---
        method = 'POST';
        apiUrl = `${API_BASE_URL}/portfolios`;
        const portfolioItemRequestDTOList = result.portfolioInput.portfolioBacktestRequestItemDTOList.map((item: any) => {
          // 사용자 정의 종목인지 확인
          if (item.customStockName && item.annualReturnRate !== undefined) {
            return {
              stockId: null,
              weight: item.weight
            };
          } else {
            return {
              stockId: item.stockId,
              weight: item.weight
            };
          }
        });
        requestBody = {
          name: modalData.name,
          description: modalData.description,
          amount: result.portfolioInput.amount,
          startDate: result.portfolioInput.startDate,
          endDate: result.portfolioInput.endDate,
          ror: result.totalRor,
          volatility: result.volatility || 0,
          price: result.totalAmount,
          portfolioItemRequestDTOList: portfolioItemRequestDTOList
        };
      }

      console.log(`API 요청 (${method}):`, apiUrl, requestBody);

      response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'accept': '*/*'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${isUpdateMode ? '수정' : '저장'} 실패: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      console.log(`${isUpdateMode ? '수정' : '저장'} 성공:`, responseData);

      showToast(`포트폴리오가 성공적으로 ${isUpdateMode ? '수정' : '저장'}되었습니다.`, 'success');
      setIsModalOpen(false);

      // 수정 모드 성공 시 sessionStorage 클리어 및 페이지 이동 (예: 포트폴리오 목록)
      if (isUpdateMode) {
        sessionStorage.removeItem(STORAGE_KEYS.UPDATED_PORTFOLIO_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.BACKTEST_RESULT); // 백테스트 결과도 제거
        router.push(`/portfolio`); // 포트폴리오 목록 페이지로 이동 (또는 상세 페이지)
      } else {
         sessionStorage.removeItem(STORAGE_KEYS.BACKTEST_RESULT); // 백테스트 결과 제거
         router.push('/portfolio'); // 저장 후 포트폴리오 목록 페이지로 이동
      }

      return Promise.resolve();

    } catch (error: unknown) {
      console.error(`${isUpdateMode ? '수정' : '저장'} 오류:`, error);
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      showToast(`${isUpdateMode ? '수정' : '저장'} 중 오류가 발생했습니다: ${message}`, 'error');
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                백테스트 결과 분석
              </h1>
              <p className="text-slate-600">
                포트폴리오 성과를 종합적으로 분석하고 투자 전략을 평가해보세요
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <button
                  onClick={handleOpenModal}
                  className={`${
                    isUpdateMode 
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  } text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105`}
                  disabled={isProcessing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isUpdateMode ? "수정 저장" : "저장하기"}
                </button>
              )}
              <Link
                href="/backtest"
                className="bg-slate-700 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 백테스트
              </Link>
            </div>
          </div>
        </div>

        {/* 주요 성과 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm font-medium">누적 수익률</p>
              <p className={`text-3xl font-bold ${result.totalRor >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatPercentage(result.totalRor)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm font-medium">최고 월 수익률</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatPercentage(highestMonthlyRor)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm font-medium">최저 월 수익률</p>
              <p className="text-3xl font-bold text-red-500">
                {formatPercentage(lowestMonthlyRor)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm font-medium">최종 자산</p>
              <p className="text-3xl font-bold text-slate-700">
                {Number(result.totalAmount).toLocaleString("ko-KR")}
                <span className="text-lg text-slate-500 ml-1">원</span>
              </p>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 포트폴리오 구성 차트 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">포트폴리오 구성</h3>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 포트폴리오 구성 테이블 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">종목별 비중</h3>
              </div>
              <div className="overflow-hidden">
                <div className="space-y-4">
                  {portfolioData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{item.name}</h4>
                          <p className="text-sm text-slate-500">종목 {index + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-700">{item.value.toFixed(1)}%</p>
                        <p className="text-sm text-slate-500">비중</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 수익률 차트 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">월별 수익률 추이</h3>
          </div>
          <div className="h-[300px] sm:h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processMonthlyData(result.monthlyRor)}
                margin={{ top: 20, right: 12, left: 4, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  tickMargin={10}
                  height={42}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  width={56}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  formatter={(value: number) => [
                    <span key="value" className="text-blue-600 font-semibold">
                      {value.toFixed(2)}%
                    </span>,
                    "수익률",
                  ]}
                  labelFormatter={(label) => (
                    <span className="text-slate-600 font-medium">{label}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="return"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 상세 성과 분석 섹션 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* 월별 성과 테이블 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V9a2 2 0 00-2 2H10a2 2 0 00-2-2V7m0 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">월별 수익률 상세</h3>
            </div>
            <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">기간</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">수익률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processMonthlyData(result.monthlyRor).map(({ date, return: ror }) => (
                    <tr key={date} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 font-medium">{date}</td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        ror >= 0 
                          ? "text-emerald-600" 
                          : "text-red-500"
                      }`}>
                        <div className="flex items-center justify-end gap-2">
                          {ror >= 0 ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {formatPercentage(ror)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 개별 종목 성과 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">개별 종목 분석</h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {result.portfolioBacktestResponseItemDTOList.map((stock: any, index: number) => (
                <div key={stock.name || stock.customStockName || index} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                      <h4 className="font-bold text-slate-800">{stock.name || stock.customStockName || "알 수 없음"}</h4>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        stock.totalRor >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {formatPercentage(stock.totalRor)}
                      </div>
                      <div className="text-xs text-slate-500">총 수익률</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-2 rounded-lg">
                      <div className="text-emerald-600 font-semibold">
                        {formatPercentage(Math.max(...Object.values<number>(stock.monthlyRor)))}
                      </div>
                      <div className="text-slate-500 text-xs">최대 수익률</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <div className="text-red-500 font-semibold">
                        {formatPercentage(Math.min(...Object.values<number>(stock.monthlyRor)))}
                      </div>
                      <div className="text-slate-500 text-xs">최대 손실</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* 저장/수정 모달 */}
      <SaveUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isProcessing}
        isUpdateMode={isUpdateMode}
        initialName={isUpdateMode ? updatedPortfolioData?.name : ""} // 수정 모드 시 초기값 전달
        initialDescription={isUpdateMode ? updatedPortfolioData?.description : ""} // 수정 모드 시 초기값 전달
      />

      {/* 토스트 알림 */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md
            ${toast.type === 'success'
              ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400/50 text-white'
              : 'bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400/50 text-white'
            }
          `}>
            {/* 아이콘 */}
            <div className={`
              p-2 rounded-full
              ${toast.type === 'success' ? 'bg-white/20' : 'bg-white/20'}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {toast.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>

            {/* 메시지 */}
            <div className="flex-1">
              <p className="font-semibold text-sm">{toast.type === 'success' ? '성공' : '오류'}</p>
              <p className="text-sm opacity-95">{toast.message}</p>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
      </div>
    </div>
  );
};


export default BacktestResult;
