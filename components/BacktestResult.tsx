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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // useRouter 추가
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isUpdateMode ? "포트폴리오 수정 저장" : "백테스트 결과 저장"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="백테스트 결과 이름"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="백테스트에 대한 간단한 설명 (선택사항)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </>
              ) : (
                isUpdateMode ? "수정 저장" : "저장하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BacktestResult = ({ result }: { result: any }) => {
  const router = useRouter(); // useRouter 훅 사용
  // 데이터 가공 함수
  const processMonthlyData = (rorObject: { [key: string]: number }) => {
    return Object.entries(rorObject)
      .map(([date, value]) => ({
        date: date.slice(0, 7),
        return: Number(value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const processPortfolioData = (portfolio: any[]) => {
    return portfolio.map((item) => ({
      name: item.stockName,
      value: item.weight * 100,
    }));
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28BFF",
    "#FF6384",
  ];

  // 공통 스타일 클래스
  const sectionStyle = "bg-white rounded-lg shadow p-6 mb-6";
  const headingStyle = "text-2xl font-bold mb-4 text-gray-800";

  // 포트폴리오 구성 데이터를 가공
  const portfolioData = processPortfolioData(
    result.portfolioInput.portfolioBacktestRequestItemDTOList
  );
  const totalPortfolioValue = portfolioData.reduce(
    (acc, cur) => acc + cur.value,
    0
  );

  // 달별 수익률 계산
  const monthlyValues = Object.values(result.monthlyRor).map((value) =>
    Number(value)
  );
  const highestMonthlyRor =
    monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0;
  const lowestMonthlyRor =
    monthlyValues.length > 0 ? Math.min(...monthlyValues) : 0;

  // 로그인 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  // 수정 모드 상태 (sessionStorage 확인)
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updatedPortfolioData, setUpdatedPortfolioData] = useState<UpdatedPortfolioData | null>(null);

  // 저장/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 저장/수정 진행 중 상태

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 로그인 토큰 확인
      const token = localStorage.getItem("accessToken");
      setIsAuthenticated(!!token);
      if (token) {
        setAccessToken(token);
      }

      // 수정 모드 데이터 확인
      const storedData = sessionStorage.getItem("updatedPortfolioData");
      if (storedData) {
        try {
          const parsedData: UpdatedPortfolioData = JSON.parse(storedData);
          setUpdatedPortfolioData(parsedData);
          setIsUpdateMode(true);
        } catch (e) {
          console.error("Failed to parse updatedPortfolioData from sessionStorage:", e);
          sessionStorage.removeItem("updatedPortfolioData"); // 파싱 실패 시 제거
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
        const portfolioItemRequestDTOList = (result.portfolioInput.portfolioBacktestRequestItemDTOList as PortfolioItem[]).map(item => ({
          stockId: item.stockId,
          // stockName은 POST 요청 시 필요 없을 수 있음 (API 명세 확인 필요)
          // stockName: item.stockName,
          weight: item.weight
        }));
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

      alert(`포트폴리오가 성공적으로 ${isUpdateMode ? '수정' : '저장'}되었습니다.`);
      setIsModalOpen(false);

      // 수정 모드 성공 시 sessionStorage 클리어 및 페이지 이동 (예: 포트폴리오 목록)
      if (isUpdateMode) {
        sessionStorage.removeItem("updatedPortfolioData");
        sessionStorage.removeItem("backtestResult"); // 백테스트 결과도 제거
        router.push(`/portfolio`); // 포트폴리오 목록 페이지로 이동 (또는 상세 페이지)
      } else {
         sessionStorage.removeItem("backtestResult"); // 백테스트 결과 제거
         router.push('/portfolio'); // 저장 후 포트폴리오 목록 페이지로 이동
      }

      return Promise.resolve();

    } catch (error: unknown) {
      console.error(`${isUpdateMode ? '수정' : '저장'} 오류:`, error);
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`${isUpdateMode ? '수정' : '저장'} 중 오류가 발생했습니다: ${message}`);
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 섹션 */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          백테스트 결과 분석
        </h1>
        <div className="flex items-center space-x-4">
          {/* 저장 또는 수정 버튼 */}
          {isAuthenticated && (
            <button
              onClick={handleOpenModal}
              className={`${isUpdateMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-lg transition-colors flex items-center`}
              disabled={isProcessing} // 처리 중 비활성화
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isUpdateMode ? "수정 저장하기" : "저장하기"}
            </button>
          )}
          {/* 새 백테스트 실행 버튼 */}
          <Link
            href="/backtest"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            새 백테스트 실행
          </Link>
        </div>
      </div>

      {/* 총 수익률 섹션 */}
      <div className={`${sectionStyle} bg-gradient-to-r from-blue-50 to-indigo-50`}>
        <h2 className={headingStyle}>포트폴리오 성능 요약</h2>
        <div className="flex flex-col md:flex-row items-baseline gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-600">
              {formatPercentage(result.totalRor)}
            </span>
            <span className="text-gray-600">누적 수익률</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPercentage(highestMonthlyRor)}
            </span>
            <span className="text-gray-600">최고 월 수익률</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">
              {formatPercentage(lowestMonthlyRor)}
            </span>
            <span className="text-gray-600">최저 월 수익률</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">
              {Number(result.totalAmount).toLocaleString("ko-KR")} 원
            </span>
            <span className="text-gray-600">최종 자산</span>
          </div>
        </div>
      </div>

      {/* 포트폴리오 구성 섹션 */}
      <div className={sectionStyle}>
        <h2 className={headingStyle}>포트폴리오 구성</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 pl-4 mt-6 md:mt-0">
            <table className="w-full text-sm text-left border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2">종목명</th>
                  <th className="border px-4 py-2">값</th>
                  <th className="border px-4 py-2">비율</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.map((item, index) => (
                  <tr key={index} className="divide-x divide-gray-200">
                    <td className="border px-4 py-2">{item.name}</td>
                    <td className="border px-4 py-2">{item.value}</td>
                    <td className="border px-4 py-2">
                      {((item.value / totalPortfolioValue) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 수익률 차트 섹션 */}
      <div className={sectionStyle}>
        <h2 className={headingStyle}>월별 수익률 추이</h2>
        <div className="h-96 overflow-x-auto">
          <ResponsiveContainer width="150%" height="100%">
            <LineChart
              data={processMonthlyData(result.monthlyRor)}
              margin={{ top: 20, right: 40, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280" }}
                interval={2}
                angle={-45}
                dy={15}
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                width={80}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number) => [
                  <span key="value" className="text-blue-600 font-semibold">
                    {value.toFixed(2)}%
                  </span>,
                  "수익률",
                ]}
                labelFormatter={(label) => (
                  <span className="text-gray-600">{label}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="return"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: "#4f46e5", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 상세 성과 테이블 섹션 */}
      <div className={sectionStyle}>
        <h2 className={headingStyle}>상세 성과 분석</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">포트폴리오 월별 성과</h3>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">월</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">수익률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processMonthlyData(result.monthlyRor).map(({ date, return: ror }) => (
                    <tr key={date}>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{date}</td>
                      <td
                        className={`px-4 py-3 text-right whitespace-nowrap ${
                          ror >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatPercentage(ror)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">개별 종목 성과</h3>
            <div className="space-y-4">
              {result.portfolioBacktestResponseItemDTOList.map((stock: any) => (
                <div key={stock.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{stock.name}</span>
                    <span
                      className={`text-sm ${
                        stock.totalRor >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercentage(stock.totalRor)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    최대 수익률:{" "}
                    {formatPercentage(
                      Math.max(...Object.values<number>(stock.monthlyRor))
                    )}
                    <br />
                    최대 손실:{" "}
                    {formatPercentage(
                      Math.min(...Object.values<number>(stock.monthlyRor))
                    )}
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
};

// 퍼센트 포맷팅 유틸리티 함수
const formatPercentage = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export default BacktestResult;
