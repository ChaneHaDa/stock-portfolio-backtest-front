"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";
import MonthPickerField from "@/components/MonthPickerField";
import { RebalanceFrequency } from "@/types/portfolio";

// --- 기존 backtest/page.tsx의 인터페이스 및 컴포넌트 재사용 ---

// PortfolioItem 인터페이스 (수정 페이지용)
interface PortfolioItem {
  stockId: number | null;
  stockName: string;
  weight: string; // UI에서는 % 단위 문자열 사용
  isCustom?: boolean; // 사용자 정의 종목 여부
  customStockName?: string; // 사용자 정의 종목 이름
  annualReturnRate?: string; // 연평균 수익률 (%)
}

// 주식 검색 API의 반환값에 맞춘 Stock 인터페이스
interface Stock {
  stockId: number;
  name: string;
  shortCode: string;
  marketCategory: string;
}

// 주식 검색 팝업 컴포넌트 (사용자 정의 종목 추가 기능 포함)
interface StockSearchModalProps {
  onSelect: (stock: Stock | { isCustom: true; customStockName: string; annualReturnRate: string }) => void;
  onClose: () => void;
}

const REBALANCE_FREQUENCY_OPTIONS: Array<{ value: RebalanceFrequency; label: string }> = [
  { value: "NONE", label: "리밸런싱 안 함" },
  { value: "DAILY", label: "일별" },
  { value: "MONTHLY", label: "월별" },
  { value: "QUARTERLY", label: "분기별" },
  { value: "YEARLY", label: "연별" },
];

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const StockSearchModal: React.FC<StockSearchModalProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 사용자 정의 종목 상태
  const [customName, setCustomName] = useState("");
  const [customReturn, setCustomReturn] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        API_BASE_URL + `/stocks?q=${encodeURIComponent(query)}`,
        { headers: { accept: "*/*" } }
      );
      if (!res.ok) {
        throw new Error("검색 실패");
      }
      const data = await res.json();
      setResults(data.data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "검색 중 오류 발생"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && activeTab === 'search') {
      handleSearch();
    }
  };

  const handleCustomSubmit = () => {
    if (!customName.trim()) {
      alert("종목명을 입력해주세요.");
      return;
    }
    if (!customReturn.trim()) {
      alert("연평균 수익률을 입력해주세요.");
      return;
    }
    
    onSelect({
      isCustom: true,
      customStockName: customName,
      annualReturnRate: customReturn
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-search-modal-title"
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-xl sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 id="stock-search-modal-title" className="text-2xl font-bold text-secondary-800">종목 선택</h2>
          <button
            onClick={onClose}
            aria-label="종목 선택 모달 닫기"
            className="text-secondary-500 hover:text-secondary-700 transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 탭 버튼 */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'search' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              기존 종목 검색
            </div>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'custom' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              사용자 정의 종목
            </div>
          </button>
        </div>

        {/* 탭 내용 */}
        {activeTab === 'search' ? (
          <>
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="종목명 또는 코드 입력"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border border-gray-300 rounded-l-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                aria-label="종목 검색"
                className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <p className="text-red-500 mb-4 p-2 bg-red-50 rounded-lg" role="alert" aria-live="assertive">{error}</p>
            )}

            <div className="max-h-[300px] overflow-y-auto">
              {results.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {results.map((stock) => (
                    <li
                      key={stock.stockId}
                      className="p-3 hover:bg-blue-50 cursor-pointer transition duration-150 rounded-md"
                      onClick={() => {
                        onSelect(stock);
                        onClose();
                      }}
                    >
                      <div className="font-medium text-gray-800">{stock.name}</div>
                      <div className="text-sm text-gray-500">
                        {stock.shortCode} - {stock.marketCategory}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : query && !loading && !error ? (
                <p className="text-center py-4 text-gray-500">검색 결과가 없습니다</p>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>종목을 검색해주세요</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> DB에 없는 자산(부동산, 채권, 금 등)을 포트폴리오에 추가할 수 있습니다.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종목명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 부동산 REIT, 금, 채권"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연평균 수익률 (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="예: 7.5"
                value={customReturn}
                onChange={(e) => setCustomReturn(e.target.value)}
                step="0.1"
                min="-100"
                max="1000"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">-100% ~ 1000% 범위 내에서 입력</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCustomSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                추가
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 포트폴리오 수정 및 백테스트 폼 ---
// API 응답 타입 정의 (포트폴리오 상세 정보 로드용)
interface PortfolioDetailItem {
  id: number;
  stockId: number;
  name: string;
  weight: number; // API 응답은 0~1
}
interface PortfolioDetail {
  id: number;
  name: string;
  description: string;
  amount: number;
  startDate: string; // YYYY-MM-DD 형식
  endDate: string;   // YYYY-MM-DD 형식
  items: PortfolioDetailItem[];
}
interface DetailApiResponse {
  status: string;
  code: string | null;
  message: string | null;
  data: PortfolioDetail;
}

const PortfolioEditForm = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined; // 포트폴리오 ID

  // 폼 상태
  const [portfolioName, setPortfolioName] = useState(""); // 포트폴리오 이름 (수정 가능하도록 추가)
  const [description, setDescription] = useState(""); // 포트폴리오 설명 (수정 가능하도록 추가)
  const [startDate, setStartDate] = useState(""); // YYYY-MM 형식
  const [endDate, setEndDate] = useState("");   // YYYY-MM 형식
  const [amount, setAmount] = useState("");     // 투자금액 (문자열)
  const [rebalanceFrequency, setRebalanceFrequency] = useState<RebalanceFrequency>("DAILY");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 백테스트 실행 중 상태

  // 주식 검색 모달 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number | null>(null);

  // 포트폴리오 데이터 로드
  useEffect(() => {
    if (!id) {
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
          headers: { accept: "*/*", Authorization: token ? `Bearer ${token}` : "" },
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const responseData: DetailApiResponse = await response.json();
        if (responseData.status === "success" && responseData.data) {
          const data = responseData.data;
          setPortfolioName(data.name);
          setDescription(data.description);
          // YYYY-MM-DD -> YYYY-MM 변환
          setStartDate(data.startDate.substring(0, 7));
          setEndDate(data.endDate.substring(0, 7));
          setAmount(data.amount.toString());
          // API weight (0~1) -> UI weight (0~100 문자열) 변환
          setPortfolioItems(data.items.map(item => ({
            stockId: item.stockId,
            stockName: item.name,
            weight: (item.weight * 100).toString(),
            isCustom: false
          })));
        } else {
          throw new Error(responseData.message || "데이터 로드 실패");
        }
      } catch (err: unknown) {
        setError(`데이터 로드 오류: ${getErrorMessage(err, "알 수 없는 오류")}`);
        console.error("Error fetching portfolio detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioDetail();
  }, [id]);

  // 백테스트 실행 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 유효성 검사 (가중치 합계, 종목 선택 등)
    const totalWeight = portfolioItems.reduce((sum, item) => sum + parseFloat(item.weight || "0"), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError("포트폴리오 항목의 총 가중치 합계는 100%가 되어야 합니다.");
      setIsSubmitting(false);
      return;
    }
    if (!isStockNameValid) {
      setError("모든 포트폴리오 항목이 올바르게 입력되어야 합니다.");
      setIsSubmitting(false);
      return;
    }

    const formattedStartDate = `${startDate}-01`;
    const formattedEndDate = `${endDate}-01`;

    // 백테스트 API 요청 데이터
    const backtestRequestBody = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      amount: Number(amount),
      rebalanceFrequency,
      portfolioBacktestRequestItemDTOList: portfolioItems.map((item) => {
        if (item.isCustom) {
          // 사용자 정의 종목인 경우
          return {
            stockId: null,
            customStockName: item.customStockName,
            annualReturnRate: parseFloat(item.annualReturnRate || "0"),
            weight: parseFloat(item.weight || "0") / 100,
          };
        } else {
          // 기존 DB 종목인 경우
          return {
            stockId: item.stockId,
            stockName: item.stockName,
            weight: parseFloat(item.weight || "0") / 100,
          };
        }
      }),
    };

    // 수정된 포트폴리오 정보 (결과 페이지에서 PUT 요청 시 사용)
    const updatedPortfolioData = {
      id: Number(id), // 포트폴리오 ID 추가
      name: portfolioName,
      description: description,
      amount: Number(amount),
      startDate: formattedStartDate, // YYYY-MM-DD 형식으로 저장
      endDate: formattedEndDate,     // YYYY-MM-DD 형식으로 저장
      portfolioItemRequestDTOList: portfolioItems.map(item => ({
        stockId: item.stockId,
        weight: parseFloat(item.weight || "0") / 100 // UI(%) -> API(0~1)
      }))
    };


    try {
      const response = await fetch(API_BASE_URL + "/portfolios/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backtestRequestBody),
      });

      if (!response.ok) {
        throw new Error(`백테스트 API 호출 오류: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        // 백테스트 결과와 수정된 포트폴리오 정보를 sessionStorage에 저장
        sessionStorage.setItem("backtestResult", JSON.stringify(data.data));
        sessionStorage.setItem("updatedPortfolioData", JSON.stringify(updatedPortfolioData)); // 수정된 정보 저장
        router.push("/backtest/result"); // 결과 페이지로 이동
      } else {
        throw new Error(data.message || "백테스트 실행 실패");
      }
    } catch (err: unknown) {
      setError(`백테스트 실행 오류: ${getErrorMessage(err, "알 수 없는 오류")}`);
      console.error("백테스트 API 호출 오류:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 포트폴리오 항목 변경 핸들러 (가중치)
  const handleItemWeightChange = (index: number, value: string) => {
    const newPortfolioItems = [...portfolioItems];
    // 숫자만 입력 가능하도록 처리 (소수점 포함)
    const numericValue = value.replace(/[^0-9.]/g, '');
    newPortfolioItems[index].weight = numericValue;
    setPortfolioItems(newPortfolioItems);
  };

  // 포트폴리오 항목 추가 핸들러
  const addPortfolioItem = () => {
    setPortfolioItems([...portfolioItems, { stockId: null, stockName: "", weight: "0", isCustom: false }]);
  };

  // 포트폴리오 항목 삭제 핸들러
  const removePortfolioItem = (index: number) => {
    const newPortfolioItems = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(newPortfolioItems);
  };

  // 주식 검색 모달 열기 핸들러
  const handleOpenSearchModal = (index: number) => {
    setCurrentSearchIndex(index);
    setIsSearchModalOpen(true);
  };

  // 주식 선택 핸들러
  const handleStockSelect = (stock: Stock | { isCustom: true; customStockName: string; annualReturnRate: string }) => {
    if (currentSearchIndex !== null) {
      const newItems = [...portfolioItems];
      
      if ('isCustom' in stock && stock.isCustom) {
        // 사용자 정의 종목
        newItems[currentSearchIndex] = {
          ...newItems[currentSearchIndex],
          isCustom: true,
          stockId: null,
          stockName: "",
          customStockName: stock.customStockName,
          annualReturnRate: stock.annualReturnRate,
          weight: newItems[currentSearchIndex].weight
        };
      } else {
        // 기존 종목
        newItems[currentSearchIndex] = {
          ...newItems[currentSearchIndex],
          isCustom: false,
          stockName: stock.name,
          stockId: stock.stockId,
          customStockName: "",
          annualReturnRate: "",
          weight: newItems[currentSearchIndex].weight
        };
      }
      
      setPortfolioItems(newItems);
    }
    setIsSearchModalOpen(false);
    setCurrentSearchIndex(null);
  };

  // 총 가중치 계산 (UI 표시용)
  const totalWeight = portfolioItems.reduce((sum, item) => sum + parseFloat(item.weight || "0"), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;
  const isStockNameValid = portfolioItems.every(item => {
    if (item.isCustom) {
      // 사용자 정의 종목은 이름과 수익률이 모두 입력되어야 함
      return item.customStockName && item.customStockName.trim() !== "" && 
             item.annualReturnRate && item.annualReturnRate.trim() !== "";
    } else {
      // 기존 종목은 종목명과 stockId가 있어야 함
      return item.stockName && item.stockName.trim() !== "" && item.stockId !== null;
    }
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">포트폴리오 정보를 불러오는 중...</p></div>;
  }

  // 에러 발생 시 (데이터 로드 실패 등)
  if (error && !portfolioItems.length) { // 로드 실패 시 에러 메시지 표시
     return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-[960px] mx-auto border border-primary-200">
        <h1 className="text-3xl font-bold text-secondary-800 mb-6 pb-2 border-b-2 border-primary-300">
          포트폴리오 수정 및 백테스트
        </h1>

        <form className="w-full" onSubmit={handleSubmit}>
          {/* 기본 정보 수정 섹션 */}
          <div className="bg-primary-50 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-semibold text-secondary-700 mb-4">기본 정보 수정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="portfolioName" className="block text-secondary-700 font-medium mb-2">
                  포트폴리오 이름
                </label>
                <input
                  type="text"
                  id="portfolioName"
                  required
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="border border-primary-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-secondary-700 font-medium mb-2">
                  설명
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-primary-300 rounded-lg p-3 w-full h-[52px] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 bg-white resize-none"
                />
              </div>
              <div>
                <MonthPickerField
                  id="startDate"
                  label="시작 날짜"
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
              </div>
              <div>
                <MonthPickerField
                  id="endDate"
                  label="종료 날짜"
                  value={endDate}
                  onChange={setEndDate}
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-secondary-700 font-medium mb-2">
                  초기 투자금액 (원)
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-primary-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label htmlFor="rebalanceFrequency" className="block text-secondary-700 font-medium mb-2">
                  리밸런싱 주기
                </label>
                <select
                  id="rebalanceFrequency"
                  value={rebalanceFrequency}
                  onChange={(e) => setRebalanceFrequency(e.target.value as RebalanceFrequency)}
                  className="border border-primary-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 bg-white"
                >
                  {REBALANCE_FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 포트폴리오 구성 수정 섹션 */}
          <div className="bg-primary-50 p-6 rounded-xl mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-secondary-700">포트폴리오 구성 수정</h2>
              <div className={`text-sm font-medium ${isWeightValid ? "text-green-600" : "text-red-600"}`}>
                총 가중치: {totalWeight.toFixed(2)}%
                {!isWeightValid && " (합계 100% 필요)"}
              </div>
            </div>

            <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
              {/* 테이블 헤더 */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-secondary-600 font-medium px-2">
                <div className="md:col-span-1">번호</div>
                <div className="md:col-span-6">종목명</div>
                <div className="md:col-span-3 text-center">비중 (%)</div>
                <div className="md:col-span-2 text-center">관리</div>
              </div>

              {portfolioItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center py-3 px-2 border-b border-primary-100 hover:bg-primary-100 transition-colors duration-150 rounded-md"
                >
                  <div className="md:col-span-1 text-secondary-600 font-medium">
                    <span className="md:hidden mr-1">번호:</span>
                    {index + 1}
                  </div>

                  <div className="md:col-span-6">
                    <p className="md:hidden text-xs text-secondary-500 mb-1">종목명</p>
                    <div className="flex items-center gap-2">
                      {item.isCustom ? (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            사용자 정의
                          </span>
                          <span className="font-medium text-gray-800">{item.customStockName}</span>
                          <span className="text-sm text-gray-500">({item.annualReturnRate}% 연)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          {item.stockName ? (
                            <>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                상장 종목
                              </span>
                              <span className="font-medium text-gray-800">{item.stockName}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">종목을 선택해주세요</span>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenSearchModal(index)}
                        aria-label={`${index + 1}번째 종목 검색`}
                        className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 비중 입력 */}
                  <div className="md:col-span-3">
                    <p className="md:hidden text-xs text-secondary-500 mb-1">비중 (%)</p>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={item.weight}
                        onChange={(e) => handleItemWeightChange(index, e.target.value)}
                        className="border border-primary-300 rounded-lg p-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <div className="md:col-span-2 flex md:justify-center">
                    <button
                      type="button"
                      onClick={() => removePortfolioItem(index)}
                      disabled={portfolioItems.length <= 1}
                      aria-label={`${index + 1}번째 자산 삭제`}
                      className={`p-2 rounded-full ${portfolioItems.length <= 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-100 text-red-600 hover:bg-red-200 transition duration-200"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 자산 추가 버튼 */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={addPortfolioItem}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                자산 추가
              </button>
            </div>
          </div>

          {/* 백테스트 실행 버튼 */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!isWeightValid || !isStockNameValid || isSubmitting}
              className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition duration-200 ${isWeightValid && isStockNameValid && !isSubmitting ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  백테스트 실행 중...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  백테스트 실행
                </>
              )}
            </button>
          </div>

          {/* 실행 중 에러 메시지 */}
          {error && <p className="text-red-500 text-center mt-4" role="alert" aria-live="polite">{error}</p>}
        </form>

        {/* StockSearchModal 팝업 */}
        {isSearchModalOpen && (
          <StockSearchModal
            onSelect={handleStockSelect}
            onClose={() => setIsSearchModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioEditForm;
