// app/layout.tsx
import './globals.css';
import Link from 'next/link';
import Nav from './components/Nav';

export const metadata = {
  title: 'main page',
  description: 'description',
};

const Layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <html lang="ko">
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <header className="bg-gray-800 text-white p-4 flex-shrink-0 flex justify-between">
          <div className="flex items-center">
            <Nav /> 
            <Link href="/" className="text-xl font-bold">
              포트폴리오 백테스트
            </Link>
          </div>

          <div>
            <Link href="/login" className="mr-4">로그인</Link>
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
