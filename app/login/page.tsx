'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/config/apiConfig";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    id: '',
    password: '',
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(API_BASE_URL+'/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // 토큰이 실제로 존재하는지 확인
        if (data.data?.accessToken) {
          // 토큰 저장
          localStorage.setItem('accessToken', data.data.accessToken);
          
          // 만약 만료 시간이 있다면 함께 저장
          if (data.data.expiresIn) {
            const expiryTime = new Date().getTime() + data.data.expiresIn * 1000;
            localStorage.setItem('tokenExpiry', expiryTime.toString());
          }
          
          // 인증 상태 업데이트
          setIsAuthenticated(true);
          setResponseMessage('로그인 성공!');
          
          // 리디렉션
          router.push('/portfolio');
        } else {
          // 토큰이 없는 경우 오류 처리
          setResponseMessage('로그인은 성공했으나 토큰을 받지 못했습니다.');
          console.error('No access token received');
        }
      } else {
        // 응답이 성공적이지 않은 경우
        setResponseMessage(data.message || '로그인 실패');
      }      
    } catch (error) {
      console.error('로그인 요청 중 에러 발생:', error);
      setIsAuthenticated(false);
      setResponseMessage('로그인 요청 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow"> 
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="id" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              사용자 ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={credentials.id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
              placeholder="아이디를 입력하세요"
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            로그인
          </button>
        </form>
        {responseMessage && (
          <div
            className={`mt-6 p-4 rounded-md text-sm ${
              isAuthenticated
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
            role="alert"
          >
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
}
