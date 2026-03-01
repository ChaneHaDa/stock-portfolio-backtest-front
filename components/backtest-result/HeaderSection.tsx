"use client";

import Link from "next/link";

interface HeaderSectionProps {
  isAuthenticated: boolean;
  isUpdateMode: boolean;
  isProcessing: boolean;
  rebalanceFrequencyLabel?: string;
  onOpenModal: () => void;
}

const HeaderSection = ({
  isAuthenticated,
  isUpdateMode,
  isProcessing,
  rebalanceFrequencyLabel,
  onOpenModal,
}: HeaderSectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">백테스트 결과 분석</h1>
          <p className="text-slate-600">포트폴리오 성과를 종합적으로 분석하고 투자 전략을 평가해보세요</p>
          {rebalanceFrequencyLabel && (
            <p className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              리밸런싱 주기: {rebalanceFrequencyLabel}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button
              onClick={onOpenModal}
              className={`${
                isUpdateMode
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
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
  );
};

export default HeaderSection;
