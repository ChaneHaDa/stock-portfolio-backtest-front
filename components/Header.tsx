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
    <header className="bg-gray-800 text-white p-4 flex-shrink-0">
      <div className="flex justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Stock Helper
          </Link>
        </div>
        <div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="mr-4">
              로그아웃
            </button>
          ) : (
            <>
              <Link href="/login" className="mr-4">
                로그인
              </Link>
              <Link href="/register" className="mr-4">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
      <hr className="border-t border-gray-300 my-1" />
      <div className="max-w-[1200px] mx-auto">
        <div>
          <Link href="/" className="mr-4">
            홈
          </Link>
          {isAuthenticated ? (
            <Link href="/portfolio" className="mr-4">
              내 포트폴리오
            </Link>
          ) : (
            <>
            </>
          )}
          <Link href="/backtest" className="mr-4">
            포트폴리오 백테스트
          </Link>
          {/* 추가 메뉴들 */}
        </div>
      </div>
    </header>
  );
};

export default Header;