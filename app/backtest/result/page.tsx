// app/backtest/result/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BacktestResult from '@/components/BacktestResult';
import { STORAGE_KEYS } from '@/utils/constants';
import { BacktestResult as BacktestResultType } from '@/types/portfolio';

export default function ResultPage() {
  const [result, setResult] = useState<BacktestResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResult = sessionStorage.getItem(STORAGE_KEYS.BACKTEST_RESULT);
    
    if (!storedResult) {
      router.push('/backtest');
      return;
    }
    
    try {
      const parsedResult = JSON.parse(storedResult);
      setResult(parsedResult);
    } catch (error) {
      console.error('Failed to parse backtest result:', error);
      router.push('/backtest');
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">백테스트 결과를 불러오는 중...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">백테스트 결과를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/backtest')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            백테스트 실행하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <BacktestResult result={result} />
    </div>
  );
}