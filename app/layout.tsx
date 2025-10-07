// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "포트폴리오 백테스팅",
  description: "나만의 투자 포트폴리오를 구성하고 백테스팅을 통해 전략을 검증해보세요.",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center p-4 mt-auto flex-shrink-0"> 
          <p>© 2025 Stock Helper</p>
        </footer>
      </body>
    </html>
  );
};

export default Layout;
