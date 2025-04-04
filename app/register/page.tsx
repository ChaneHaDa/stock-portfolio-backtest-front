'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/config/apiConfig";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    phoneNumber: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isUsernameDisabled, setIsUsernameDisabled] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResponseMessage, setEmailResponseMessage] = useState('');
  const [isEmailSuccess, setIsEmailSuccess] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'phoneNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 7) {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (name === 'username') {
      setIsUsernameChecked(false);
      setIsUsernameDisabled(false);
      setResponseMessage('');
    }

    if (name === 'email') {
      setIsEmailSent(false);
      setEmailVerificationCode('');
      setEmailResponseMessage('');
      setIsEmailVerified(false);
    }
  }, []);

  const handleCheckUsername = async () => {
    if (!formData.username) {
      setResponseMessage('ID를 입력해주세요.');
      setIsSuccess(false);
      return;
    }

    try {
      const checkUrl = `${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(formData.username)}`;
      const response = await fetch(checkUrl);

      if (response.ok) {
        setResponseMessage('사용 가능한 ID입니다.');
        setIsSuccess(true);
        setIsUsernameChecked(true);
        setIsUsernameDisabled(true);
      } else {
        const errorData = await response.json();
        setResponseMessage(`사용할 수 없는 ID입니다: ${errorData.message || response.statusText}`);
        setIsSuccess(false);
        setIsUsernameChecked(false);
        setIsUsernameDisabled(false);
      }
    } catch (error) {
      console.error('ID 중복 확인 중 에러 발생:', error);
      setResponseMessage('ID 중복 확인 중 문제가 발생했습니다.');
      setIsSuccess(false);
      setIsUsernameChecked(false);
      setIsUsernameDisabled(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!formData.email) {
      setEmailResponseMessage('이메일을 입력해주세요.');
      setIsEmailSuccess(false);
      return;
    }
    setIsSendingEmail(true);
    setEmailResponseMessage('');

    try {
      const emailUrl = `${API_BASE_URL}/auth/initiate-email?email=${encodeURIComponent(formData.email)}`;
      const response = await fetch(emailUrl, { method: 'GET' });

      if (response.ok) {
        setEmailResponseMessage('인증 메일이 전송되었습니다. 이메일을 확인해주세요.');
        setIsEmailSuccess(true);
        setIsEmailSent(true);
      } else {
        let errorMsg = `인증 메일 전송 실패: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = `인증 메일 전송 실패: ${errorData.message || response.statusText}`;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
        }
        setEmailResponseMessage(errorMsg);
        setIsEmailSuccess(false);
        setIsEmailSent(false);
      }
    } catch (error) {
      console.error('이메일 인증 메일 전송 중 에러 발생:', error);
      setEmailResponseMessage('이메일 인증 메일 전송 중 문제가 발생했습니다.');
      setIsEmailSuccess(false);
      setIsEmailSent(false);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailVerificationCode) {
      setEmailResponseMessage('인증 코드를 입력해주세요.');
      setIsEmailSuccess(false);
      return;
    }
    setIsVerifyingEmail(true);
    setEmailResponseMessage('');

    try {
      const verifyUrl = `${API_BASE_URL}/auth/verify-email?email=${encodeURIComponent(formData.email)}&token=${encodeURIComponent(emailVerificationCode)}`;
      const response = await fetch(verifyUrl, { method: 'GET' });

      if (response.ok) {
        setEmailResponseMessage('이메일 인증이 완료되었습니다.');
        setIsEmailSuccess(true);
        setIsEmailVerified(true);
      } else {
        let errorMsg = `이메일 인증 실패: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = `이메일 인증 실패: ${errorData.message || response.statusText}`;
        } catch (jsonError) {
          console.error('Error parsing verification error response:', jsonError);
        }
        setEmailResponseMessage(errorMsg);
        setIsEmailSuccess(false);
        setIsEmailVerified(false);
      }
    } catch (error) {
      console.error('이메일 인증 확인 중 에러 발생:', error);
      setEmailResponseMessage('이메일 인증 확인 중 문제가 발생했습니다.');
      setIsEmailSuccess(false);
      setIsEmailVerified(false);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUsernameChecked) {
      setResponseMessage('ID 중복 확인을 먼저 진행해주세요.');
      setIsSuccess(false);
      return;
    }

    if (!isEmailVerified) {
      setResponseMessage('이메일 인증을 완료해주세요.');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        const data = await response.json();
        setIsSuccess(true);
        setResponseMessage(`회원가입 성공! ID: ${data.data.id}, Username: ${data.data.username}`);
        setTimeout(() => {
          router.push('/login');
        }, 1500); // 1.5초 후 로그인 페이지로 이동
      } else {
        const errorData = await response.json();
        setIsSuccess(false);
        setResponseMessage(`회원가입 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('회원가입 요청 중 에러 발생:', error);
      setIsSuccess(false);
      setResponseMessage('회원가입 요청 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 아이디 필드 */}
        <div className="relative">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            아이디
          </label>
          <div className="flex">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isUsernameDisabled}
              className={`w-full p-2.5 border ${isUsernameChecked ? 'border-green-500' : 'border-gray-300'} rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isUsernameDisabled ? 'bg-gray-50 text-gray-500' : ''}`}
              placeholder="예: userid123"
            />
            <button
              type="button"
              onClick={handleCheckUsername}
              disabled={isUsernameDisabled || !formData.username}
              className={`px-3 py-2.5 rounded-r-lg text-white ${isUsernameChecked ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm whitespace-nowrap`}
            >
              {isUsernameChecked ? '확인' : '확인'}
            </button>
          </div>
          {responseMessage && !isSuccess && (
            <p className="mt-1 text-sm text-red-600">{responseMessage}</p>
          )}
          {responseMessage && isSuccess && isUsernameChecked && (
            <p className="mt-1 text-sm text-green-600">{responseMessage}</p>
          )}
        </div>

        {/* 비밀번호 필드 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {/* 이메일 필드 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <div className="flex">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="예: example@email.com"
              disabled={isEmailVerified || isEmailSent}
              className={`w-full p-2.5 border ${isEmailVerified ? 'border-green-500' : 'border-gray-300'} rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isEmailVerified || isEmailSent ? 'bg-gray-50 text-gray-500' : ''}`}
            />
            <button
              type="button"
              onClick={handleSendVerificationEmail}
              disabled={!formData.email || isEmailVerified || isEmailSent || isSendingEmail}
              className={`px-3 py-2.5 rounded-r-lg text-white ${isEmailVerified ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm whitespace-nowrap`}
            >
              {isSendingEmail ? '전송중' : isEmailSent ? '전송됨' : '전송'}
            </button>
          </div>
          {emailResponseMessage && (
            <p className={`mt-1 text-sm ${isEmailSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {emailResponseMessage}
            </p>
          )}

          {/* 인증 코드 입력 필드 */}
          {isEmailSent && !isEmailVerified && (
            <div className="mt-3">
              <label htmlFor="emailVerificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                인증 코드
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="emailVerificationCode"
                  name="emailVerificationCode"
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                  required
                  disabled={isEmailVerified || isVerifyingEmail}
                  className={`w-full p-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isEmailVerified ? 'bg-gray-50 text-gray-500' : ''}`}
                  placeholder="인증 코드 입력"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={!emailVerificationCode || isEmailVerified || isVerifyingEmail}
                  className="px-3 py-2.5 rounded-r-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm whitespace-nowrap"
                >
                  {isVerifyingEmail ? '확인중' : '확인'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 이름 필드 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="예: 홍길동"
          />
        </div>

        {/* 전화번호 필드 */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            전화번호
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="예: 010-1234-5678"
          />
        </div>

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          disabled={!isUsernameChecked || !isEmailVerified || isSubmitting}
          className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg font-medium mt-6"
        >
          {isSubmitting ? '처리중' : '회원가입'}
        </button>
      </form>

      {/* 결과 메시지 */}
      {responseMessage && isSuccess && (
        <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800 text-center">
          {responseMessage}
        </div>
      )}
    </div>
  );
}