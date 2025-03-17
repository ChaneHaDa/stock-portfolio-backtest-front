// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header"; // Header 컴포넌트의 경로에 맞게 조정

export const metadata = {
  title: "main page",
  description: "description",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className="p-8 flex-grow">{children}</main>
        <footer className="bg-gray-800 text-white text-center p-4 mt-8 flex-shrink-0">
          <p>© 2025 Stock Helper</p>
        </footer>
      </body>
    </html>
  );
};

export default Layout;