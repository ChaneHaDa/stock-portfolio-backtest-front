// app/backtest/result/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BacktestResult from '@/components/BacktestResult';

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('backtestResult');
    
    if (!storedResult) {
      router.push('/backtest');
      return;
    }
    
    setResult(JSON.parse(storedResult));
    setTimeout(() => {
        sessionStorage.removeItem("backtestResult");
      }, 1000);
  }, [router]);

  if (!result) return null;

  return (
    <div className="container mx-auto p-4">
      <BacktestResult result={result} />
    </div>
  );
}