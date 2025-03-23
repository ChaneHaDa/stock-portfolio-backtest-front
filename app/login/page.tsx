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
          router.push('/dashboard');
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium">
            사용자 ID
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={credentials.id}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          로그인
        </button>
      </form>
      {responseMessage && (
        <div
          className={`mt-4 p-3 rounded ${
            isAuthenticated
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {responseMessage}
        </div>
      )}
    </div>
  );
}
