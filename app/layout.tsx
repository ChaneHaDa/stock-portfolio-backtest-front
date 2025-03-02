// app/layout.tsx
import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'main page',
  description: 'description',
};

const Layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <html lang="ko">
      <body className="bg-gray-100 min-h-screen flex flex-col justify-center">
        <header className="bg-gray-800 text-white p-4 flex-shrink-0">
          <div className="flex justify-between max-w-[1200px] mx-auto">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                Stock Helper
              </Link>
            </div>
            <div>
              <Link href="/login" className="mr-4">로그인</Link>
              <Link href="/register" className="mr-4">회원가입</Link>
            </div>
          </div>
          <hr className="border-t border-gray-300 my-1" />
          <div className="max-w-[1200px] mx-auto">
            <div className="">
              <Link href="/backtest" className="mr-4">포트폴리오 백테스트</Link>
              {/* <Link href="/login" className="mr-4">메뉴2</Link>
              <Link href="/login" className="mr-4">메뉴3</Link>
              <Link href="/login" className="mr-4">메뉴4</Link> */}
            </div>
          </div>
        </header>

        <main className="p-8 flex-grow">
          {children}
        </main>

        <footer className="bg-gray-800 text-white text-center p-4 mt-8 flex-shrink-0">
          <p></p>
        </footer>
      </body>
    </html>
  );
};

export default Layout;
