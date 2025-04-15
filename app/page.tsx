"use client"; // 클라이언트 컴포넌트로 변경
import React, { useState, useEffect } from 'react'; // useState, useEffect 임포트
import Link from 'next/link';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [kospiIndex, setKospiIndex] = useState<string | number>('로딩 중...'); // 코스피 지수 상태 추가

  useEffect(() => {
    // localStorage에서 토큰 확인
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);

    // 코스피 지수 데이터 가져오기 (클라이언트 측)
    fetch('http://localhost:8080/api/v1/index/코스피/price')
      .then((res) => res.json())
      .then((data) => setKospiIndex(data.closePrice))
      .catch(() => setKospiIndex('데이터를 가져오지 못했습니다.'));
  }, []); // 컴포넌트 마운트 시 한 번 실행

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">나만의 투자 포트폴리오 관리</h1>
        <p className="text-lg text-gray-600">
          포트폴리오를 구성하고 백테스팅을 통해 전략을 검증해보세요.
        </p>
      </div>

      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-md text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800">현재 코스피 지수</h2>
        <p className="mt-4 text-2xl font-semibold text-blue-600">{kospiIndex}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isAuthenticated ? (
          // 로그인 상태일 때: 포트폴리오 관리 + 백테스팅
          <>
            <Link href="/portfolio">
              <div className="block p-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 cursor-pointer text-center">
                <h3 className="text-2xl font-semibold mb-2">포트폴리오 관리</h3>
                <p>나만의 투자 포트폴리오를 생성하고 관리하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="block p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 cursor-pointer text-center">
                <h3 className="text-2xl font-semibold mb-2">백테스팅</h3>
                <p>과거 데이터를 기반으로 투자 전략의 성과를 분석하세요.</p>
              </div>
            </Link>
          </>
        ) : (
          // 로그아웃 상태일 때: 회원가입 + 백테스팅
          <>
            <Link href="/register">
              <div className="block p-6 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition duration-300 cursor-pointer text-center">
                <h3 className="text-2xl font-semibold mb-2">회원가입</h3>
                <p>지금 가입하고 포트폴리오 관리를 시작하세요.</p>
              </div>
            </Link>
            <Link href="/backtest">
              <div className="block p-6 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 cursor-pointer text-center">
                <h3 className="text-2xl font-semibold mb-2">백테스팅 체험</h3>
                <p>로그인 없이 백테스팅 기능을 체험해보세요.</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
