"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";

// --- 기존 backtest/page.tsx의 인터페이스 및 컴포넌트 재사용 ---

// PortfolioItem 인터페이스 (수정 페이지용)
interface PortfolioItem {
  stockId: number | null;
  stockName: string;
  weight: string; // UI에서는 % 단위 문자열 사용
}

// 주식 검색 API의 반환값에 맞춘 Stock 인터페이스
interface Stock {
  stockId: number;
  name: string;
  shortCode: string;
  marketCategory: string;
}

// 주식 검색 팝업 컴포넌트 (backtest/page.tsx와 동일)
interface StockSearchModalProps {
  onSelect: (stock: Stock) => void;
  onClose: () => void;
}

const StockSearchModal: React.FC<StockSearchModalProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err: any) {
      setError(err.message || "검색 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl w-[450px] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">주식 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
          >
            {/* Close Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
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
            className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition duration-200 flex items-center"
          >
            {/* Search Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
        {/* Loading, Error, Results */}
        {loading && <div className="flex justify-center items-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}
        {error && <p className="text-red-500 mb-4 p-2 bg-red-50 rounded-lg">{error}</p>}
        <div className="max-h-[300px] overflow-y-auto">
          {results.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {results.map((stock) => (
                <li key={stock.stockId} className="p-3 hover:bg-blue-50 cursor-pointer transition duration-150 rounded-md" onClick={() => { onSelect(stock); onClose(); }}>
                  <div className="font-medium text-gray-800">{stock.name}</div>
                  <div className="text-sm text-gray-500">{stock.shortCode} - {stock.marketCategory}</div>
                </li>
              ))}
            </ul>
          ) : query && !loading && !error ? (
            <p className="text-center py-4 text-gray-500">검색 결과가 없습니다</p>
          ) : null}
        </div>
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
            weight: (item.weight * 100).toString()
          })));
        } else {
          throw new Error(responseData.message || "데이터 로드 실패");
        }
      } catch (err: any) {
        setError(`데이터 로드 오류: ${err.message}`);
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
    if (portfolioItems.some(item => !item.stockId || !item.stockName)) {
      setError("모든 포트폴리오 항목에 유효한 주식이 선택되어야 합니다.");
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
      portfolioBacktestRequestItemDTOList: portfolioItems.map((item) => ({
        stockId: item.stockId,
        stockName: item.stockName,
        weight: parseFloat(item.weight || "0") / 100, // UI(%) -> API(0~1)
      })),
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
    } catch (err: any) {
      setError(`백테스트 실행 오류: ${err.message}`);
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
    setPortfolioItems([...portfolioItems, { stockId: null, stockName: "", weight: "0" }]);
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
  const handleStockSelect = (stock: Stock) => {
    if (currentSearchIndex !== null) {
      const newItems = [...portfolioItems];
      newItems[currentSearchIndex].stockName = stock.name;
      newItems[currentSearchIndex].stockId = stock.stockId;
      setPortfolioItems(newItems);
    }
    setIsSearchModalOpen(false);
    setCurrentSearchIndex(null);
  };

  // 총 가중치 계산 (UI 표시용)
  const totalWeight = portfolioItems.reduce((sum, item) => sum + parseFloat(item.weight || "0"), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;
  const isStockNameValid = portfolioItems.every(item => item.stockName.trim() !== "" && item.stockId !== null);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg">포트폴리오 정보를 불러오는 중...</p></div>;
  }

  // 에러 발생 시 (데이터 로드 실패 등)
  if (error && !portfolioItems.length) { // 로드 실패 시 에러 메시지 표시
     return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }


  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-[960px] mx-auto my-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
        포트폴리오 수정 및 백테스트
      </h1>

      <form className="w-full" onSubmit={handleSubmit}>
        {/* 기본 정보 수정 섹션 */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">기본 정보 수정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label htmlFor="portfolioName" className="block text-gray-700 font-medium mb-2">
                 포트폴리오 이름
               </label>
               <input
                 type="text"
                 id="portfolioName"
                 required
                 value={portfolioName}
                 onChange={(e) => setPortfolioName(e.target.value)}
                 className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
               />
             </div>
             <div>
               <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                 설명
               </label>
               <textarea
                 id="description"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="border border-gray-300 rounded-lg p-3 w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
               />
             </div>
            <div>
              <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                시작 날짜 (백테스트 기간)
              </label>
              <input
                type="month"
                id="startDate"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
                종료 날짜 (백테스트 기간)
              </label>
              <input
                type="month"
                id="endDate"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                초기 투자금액 (원)
              </label>
              <input
                type="number"
                id="amount"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* 포트폴리오 구성 수정 섹션 */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">포트폴리오 구성 수정</h2>
            <div className={`text-sm font-medium ${isWeightValid ? "text-green-600" : "text-red-600"}`}>
              총 가중치: {totalWeight.toFixed(2)}%
              {!isWeightValid && " (합계 100% 필요)"}
            </div>
          </div>

          <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-12 gap-4 mb-2 text-gray-600 font-medium px-2">
              <div className="col-span-1">번호</div>
              <div className="col-span-6">종목명</div>
              <div className="col-span-3 text-center">비중 (%)</div>
              <div className="col-span-2 text-center">관리</div>
            </div>

            {/* 테이블 바디 */}
            {portfolioItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 items-center py-3 px-2 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 rounded-md"
              >
                <div className="col-span-1 text-gray-600 font-medium">{index + 1}</div>
                {/* 종목명 (검색 버튼 포함) */}
                <div className="col-span-6">
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      value={item.stockName}
                      readOnly
                      placeholder="종목을 검색하세요"
                      className={`border border-gray-300 rounded-lg p-2 w-full focus:outline-none ${item.stockName ? 'bg-gray-100' : 'bg-yellow-100'}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenSearchModal(index)}
                      className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200 flex-shrink-0"
                    >
                      {/* Search Icon SVG */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                  </div>
                </div>
                {/* 비중 입력 */}
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="text" // text 타입으로 변경하여 소수점 입력 용이하게
                      inputMode="decimal" // 모바일 숫자 키패드 (소수점 포함)
                      required
                      value={item.weight}
                      onChange={(e) => handleItemWeightChange(index, e.target.value)}
                      className="border border-gray-300 rounded-lg p-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                {/* 삭제 버튼 */}
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removePortfolioItem(index)}
                    disabled={portfolioItems.length <= 1}
                    className={`p-2 rounded-full ${portfolioItems.length <= 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-100 text-red-600 hover:bg-red-200 transition duration-200"}`}
                  >
                    {/* Delete Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {/* Plus Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              자산 추가
            </button>
          </div>
        </div>

        {/* 백테스트 실행 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isWeightValid || !isStockNameValid || isSubmitting}
            className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition duration-200 ${isWeightValid && isStockNameValid && !isSubmitting ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                백테스트 실행 중...
              </>
            ) : (
              <>
                {/* Chart Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                백테스트 실행
              </>
            )}
          </button>
        </div>
        {/* 실행 중 에러 메시지 */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </form>

      {/* StockSearchModal 팝업 */}
      {isSearchModalOpen && (
        <StockSearchModal
          onSelect={handleStockSelect}
          onClose={() => setIsSearchModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PortfolioEditForm;
