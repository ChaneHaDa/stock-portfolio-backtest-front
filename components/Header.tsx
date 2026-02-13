"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (route: string) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  };

  const navItems = [
    { href: "/", label: "홈", showWhenAuth: "both" },
    { href: "/portfolio", label: "내 포트폴리오", showWhenAuth: "auth" },
    { href: "/stocks", label: "주식 정보", showWhenAuth: "both" },
    { href: "/backtest", label: "백테스트", showWhenAuth: "both" },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent hover:from-sky-300 hover:to-cyan-300 transition-all duration-200"
            >
              Stock Helper
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                if (item.showWhenAuth === "auth" && !isAuthenticated) return null;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(item.href)
                        ? "bg-slate-700 text-white shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-red-600/20 hover:border-red-500/50 text-sm font-medium transition-all duration-200 border border-transparent"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute("/login")
                      ? "bg-slate-700 text-white shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute("/register")
                      ? "bg-slate-700 text-white shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                if (item.showWhenAuth === "auth" && !isAuthenticated) return null;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(item.href)
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-red-600/20 text-sm font-medium transition-all duration-200 text-left"
                  >
                    로그아웃
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveRoute("/login")
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActiveRoute("/register")
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
