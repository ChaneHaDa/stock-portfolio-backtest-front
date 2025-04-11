// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "main page",
  description: "description",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        {/* main 영역이 flex 컨테이너가 되어 내부 콘텐츠를 중앙 정렬하도록 수정 */}
        <main className="p-8 flex-grow flex flex-col items-center justify-center">{children}</main> 
        {/* 푸터가 항상 하단에 고정되도록 mt-auto 사용 */}
        <footer className="bg-gray-800 text-white text-center p-4 mt-auto flex-shrink-0"> 
          <p>© 2025 Stock Helper</p>
        </footer>
      </body>
    </html>
  );
};

export default Layout;
