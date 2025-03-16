"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/apiConfig";

// PortfolioItem 인터페이스에 stockId 추가 (선택되지 않은 경우 null)
interface PortfolioItem {
  stockId: number | null;
  stockName: string;
  weight: string;
}

// 주식 검색 API의 반환값에 맞춘 Stock 인터페이스
interface Stock {
  stockId: number;
  name: string;
  shortCode: string;
  marketCategory: string;
}

// 주식 검색 팝업 컴포넌트 (이전과 동일)
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <p className="text-red-500 mb-4 p-2 bg-red-50 rounded-lg">{error}</p>
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

const PortfolioForm = () => {
  const [startDate, setStartDate] = useState("2020-01");
  const [endDate, setEndDate] = useState("2024-01");
  const [amount, setAmount] = useState("100000"); // 투자금액 상태 (문자열)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    { stockId: 1, stockName: "삼성전자", weight: "1" },
  ]);
  const router = useRouter();

  // 주식 검색 모달 제어를 위한 상태
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  // 현재 검색할 항목의 인덱스
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedStartDate = `${startDate}-01`;
    const formattedEndDate = `${endDate}-01`;

    const response = await fetch(API_BASE_URL + "/portfolios/backtest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        amount: Number(amount),
        portfolioBacktestRequestItemDTOList: portfolioItems.map((item) => ({
          stockId: item.stockId,
          stockName: item.stockName,
          weight: parseFloat(item.weight),
        })),
      }),
    });

    console.log(response);

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem("backtestResult", JSON.stringify(data.data));
      router.push("/backtest/result");
    } else {
      console.error("API 호출 오류:", response.statusText);
    }
  };

  // 기존 handleChange: portfolioItems 업데이트
  const handleChange = (
    index: number,
    field: keyof PortfolioItem,
    value: string
  ) => {
    const newPortfolioItems = [...portfolioItems];
    
    // 타입 안전한 방식으로 값 할당
    if (field === 'stockName' || field === 'weight') {
      newPortfolioItems[index][field] = value;
    }
    
    setPortfolioItems(newPortfolioItems);
  };

  const addPortfolioItem = () => {
    setPortfolioItems([...portfolioItems, { stockId: null, stockName: "", weight: "0" }]);
  };

  const removePortfolioItem = (index: number) => {
    const newPortfolioItems = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(newPortfolioItems);
  };

  // 주식 검색 모달에서 주식 선택 시 호출할 콜백
  const handleStockSelect = (stock: Stock) => {
    if (currentSearchIndex !== null) {
      const newItems = [...portfolioItems];
      newItems[currentSearchIndex].stockName = stock.name;
      newItems[currentSearchIndex].stockId = stock.stockId;
      setPortfolioItems(newItems);
    }
  };

  // 총 가중치 계산
  const totalWeight = portfolioItems.reduce(
    (sum, item) => sum + parseFloat(item.weight || "0"),
    0
  );

  // 가중치 유효성 검사 -> 소수 범위 문제
  const isWeightValid = Math.abs(totalWeight - 1) < 0.0001;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-[960px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-gray-200">
        포트폴리오 백테스트
      </h1>
      
      <form className="w-full" onSubmit={handleSubmit}>
        {/* 기본 설정 섹션 */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">기본 설정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                시작 날짜
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
                종료 날짜
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

        {/* 포트폴리오 구성 섹션 */}
        <div className="bg-gray-50 p-6 rounded-xl mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">포트폴리오 구성</h2>
            <div className={`text-sm font-medium ${isWeightValid ? "text-green-600" : "text-red-600"}`}>
              총 가중치: {totalWeight.toFixed(2)}
              {!isWeightValid && " (가중치 합계는 1이 되어야 합니다)"}
            </div>
          </div>

          <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-12 gap-4 mb-2 text-gray-600 font-medium px-2">
              <div className="col-span-1">번호</div>
              <div className="col-span-7">종목명</div>
              <div className="col-span-2 text-center">비중</div>
              <div className="col-span-2 text-center">관리</div>
            </div>
            
            {portfolioItems.map((item, index) => (
              <div 
                key={index} 
                className="grid grid-cols-12 gap-4 items-center py-3 px-2 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 rounded-md"
              >
                <div className="col-span-1 text-gray-600 font-medium">
                  {index + 1}
                </div>
                
                <div className="col-span-7">
                  <div className="flex items-center">
                    <input
                      type="text"
                      id={`stockName-${index}`}
                      required
                      value={item.stockName}
                      readOnly
                      placeholder="종목을 검색하세요"
                      className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSearchIndex(index);
                        setIsSearchModalOpen(true);
                      }}
                      className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="number"
                      id={`weight-${index}`}
                      min="0"
                      max="1"
                      step="0.01"
                      required
                      value={item.weight}
                      onChange={(e) => handleChange(index, "weight", e.target.value)}
                      className="border border-gray-300 rounded-lg p-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removePortfolioItem(index)}
                    disabled={portfolioItems.length <= 1}
                    className={`p-2 rounded-full ${
                      portfolioItems.length <= 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-100 text-red-600 hover:bg-red-200 transition duration-200"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={addPortfolioItem}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              자산 추가
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isWeightValid}
            className={`flex items-center px-6 py-3 rounded-lg text-lg font-medium transition duration-200 ${
              isWeightValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            백테스트 실행
          </button>
        </div>
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

export default PortfolioForm;