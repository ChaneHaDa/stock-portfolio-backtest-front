"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="bg-primary-800 text-white p-4 flex-shrink-0 shadow-lg">
      <div className="flex justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary-100 hover:text-white transition-colors">
            Stock Helper
          </Link>
        </div>
        <div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="mr-4 px-3 py-1 rounded bg-primary-600 hover:bg-primary-700 transition-colors">
              로그아웃
            </button>
          ) : (
            <>
              <Link href="/login" className="mr-4 px-3 py-1 rounded border border-primary-600 hover:bg-primary-700 transition-colors">
                로그인
              </Link>
              <Link href="/register" className="mr-4 px-3 py-1 rounded bg-primary-600 hover:bg-primary-500 transition-colors">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
      <hr className="border-t border-primary-600 my-1" />
      <div className="max-w-[1200px] mx-auto">
        <div>
          <Link href="/" className="mr-6 text-primary-200 hover:text-white transition-colors">
            홈
          </Link>
          {isAuthenticated ? (
            <Link href="/portfolio" className="mr-6 text-primary-200 hover:text-white transition-colors">
              내 포트폴리오
            </Link>
          ) : (
            <>
            </>
          )}
          <Link href="/backtest" className="mr-6 text-primary-200 hover:text-white transition-colors">
            포트폴리오 백테스트
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;