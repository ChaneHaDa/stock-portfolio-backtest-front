"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { INVESTMENT_TIPS } from '@/utils/constants';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [investmentTip, setInvestmentTip] = useState('');

  useEffect(() => {
    // 투자 팁 설정
    setInvestmentTip(INVESTMENT_TIPS[Math.floor(Math.random() * INVESTMENT_TIPS.length)]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-800 mb-4">나만의 투자 포트폴리오 관리</h1>
        <p className="text-lg text-secondary-600">
          포트폴리오를 구성하고 백테스팅을 통해 전략을 검증해보세요.
        </p>
      </div>

      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg text-center mb-12 border border-primary-100">
        <h2 className="text-3xl font-bold text-secondary-800 mb-4">오늘의 투자 팁</h2>
        <p className="text-xl text-primary-600 italic font-medium">&ldquo;{investmentTip}&rdquo;</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isAuthenticated ? (
          // 로그인 상태일 때: 포트폴리오 관리 + 백테스팅
          <>
            <Link href="/portfolio">
              <div className="p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">포트폴리오 관리</h3>
                <p className="text-primary-100">나만의 투자 포트폴리오를 생성하고 관리하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="p-8 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">백테스팅</h3>
                <p className="text-secondary-200">과거 데이터를 기반으로 투자 전략의 성과를 분석하세요.</p>
              </div>
            </Link>
          </>
        ) : (
          // 로그아웃 상태일 때: 회원가입 + 백테스팅
          <>
            <Link href="/register">
              <div className="p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">회원가입</h3>
                <p className="text-primary-100">지금 가입하고 포트폴리오 관리를 시작하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="p-8 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1">
                <h3 className="text-2xl font-semibold mb-3">백테스팅 체험</h3>
                <p className="text-secondary-200">로그인 없이 백테스팅 기능을 체험해보세요.</p>
              </div>
            </Link>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default Home;
