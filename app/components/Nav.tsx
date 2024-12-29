"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const Nav: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (isNavOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsNavOpen(false)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavOpen]);

  return (
    <div className="relative">
      <button onClick={toggleNav} className="mr-4">
        {isNavOpen ? '닫기' : '메뉴'}
      </button>

      {isNavOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" />
      )}

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black p-4 transition-transform duration-300 transform z-20 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <ul className="flex flex-col">
          <li><Link href="/">홈</Link></li>
          <li><Link href="/about">소개</Link></li>
          <li><Link href="/contact">연락처</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Nav;
