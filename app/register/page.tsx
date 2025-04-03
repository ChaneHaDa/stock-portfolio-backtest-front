'use client';

import { useState, useCallback } from 'react'; // useCallback 추가
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
  const [isUsernameChecked, setIsUsernameChecked] = useState(false); // ID 중복 확인 상태
  const [isUsernameDisabled, setIsUsernameDisabled] = useState(false); // ID 입력 필드 비활성화 상태
  const [emailVerificationCode, setEmailVerificationCode] = useState(''); // 이메일 인증 코드
  const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 전송 여부
  const [isSendingEmail, setIsSendingEmail] = useState(false); // 이메일 전송 중 상태
  const [emailResponseMessage, setEmailResponseMessage] = useState(''); // 이메일 관련 메시지
  const [isEmailSuccess, setIsEmailSuccess] = useState(false); // 이메일 작업 성공 여부
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false); // 이메일 인증 확인 중 상태
  const router = useRouter(); // useRouter 사용

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'phoneNumber') {
      // 숫자만 추출
      const digits = value.replace(/\D/g, '');
      // 000-0000-0000 형식으로 포맷팅
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 7) {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    // ID 입력값이 변경되면 중복 확인 상태 초기화
    if (name === 'username') {
      setIsUsernameChecked(false);
      setIsUsernameDisabled(false);
      setResponseMessage(''); // 관련 메시지 초기화
    }

    // 이메일 입력값이 변경되면 이메일 인증 상태 초기화
    if (name === 'email') {
      setIsEmailSent(false);
      setEmailVerificationCode('');
      setEmailResponseMessage('');
      setIsEmailVerified(false); // 이메일 변경 시 인증 상태 초기화
    }
  }, []); // useCallback 사용

  // ID 중복 확인 함수
  const handleCheckUsername = async () => {
    if (!formData.username) {
      setResponseMessage('ID를 입력해주세요.');
      setIsSuccess(false);
      return;
    }

    try {
      // API_BASE_URL을 사용하여 URL 구성
      const checkUrl = `${API_BASE_URL}/auth/check-username?username=${encodeURIComponent(formData.username)}`;
      const response = await fetch(checkUrl);

      if (response.ok) { // 200 OK
        setResponseMessage('사용 가능한 ID입니다.');
        setIsSuccess(true);
        setIsUsernameChecked(true);
        setIsUsernameDisabled(true); // ID 필드 비활성화
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

  // 이메일 인증 메일 전송 함수
  const handleSendVerificationEmail = async () => {
    if (!formData.email) {
      setEmailResponseMessage('이메일을 입력해주세요.');
      setIsEmailSuccess(false);
      return;
    }
    setIsSendingEmail(true); // 전송 시작
    setEmailResponseMessage(''); // 이전 메시지 초기화

    try {
      const emailUrl = `${API_BASE_URL}/auth/initiate-email?email=${encodeURIComponent(formData.email)}`;
      const response = await fetch(emailUrl, { method: 'GET' }); // GET 요청 명시

      if (response.ok) { // 200 OK 또는 성공적인 상태 코드
        setEmailResponseMessage('인증 메일이 전송되었습니다. 이메일을 확인해주세요.');
        setIsEmailSuccess(true);
        setIsEmailSent(true); // 이메일 전송 성공 상태 업데이트
      } else {
        // 서버에서 오류 메시지를 보냈는지 확인
        let errorMsg = `인증 메일 전송 실패: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = `인증 메일 전송 실패: ${errorData.message || response.statusText}`;
        } catch (jsonError) {
          // JSON 파싱 실패 시 기본 메시지 사용
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
      setIsSendingEmail(false); // 전송 완료 (성공/실패 무관)
    }
  };

  // 이메일 인증 코드 확인 함수
  const handleVerifyEmail = async () => {
    if (!emailVerificationCode) {
      setEmailResponseMessage('인증 코드를 입력해주세요.');
      setIsEmailSuccess(false);
      return;
    }
    setIsVerifyingEmail(true);
    setEmailResponseMessage(''); // 이전 메시지 초기화

    try {
      const verifyUrl = `${API_BASE_URL}/auth/verify-email?email=${encodeURIComponent(formData.email)}&token=${encodeURIComponent(emailVerificationCode)}`;
      const response = await fetch(verifyUrl, { method: 'GET' });

      if (response.ok) {
        setEmailResponseMessage('이메일 인증이 완료되었습니다.');
        setIsEmailSuccess(true);
        setIsEmailVerified(true); // 인증 완료 상태 업데이트
        // 성공 시 이메일, 인증 코드 입력 필드, 인증 버튼들 비활성화 (이미 disabled 속성으로 처리됨)
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

    // ID 중복 확인 여부 검사
    if (!isUsernameChecked) {
      setResponseMessage('ID 중복 확인을 먼저 진행해주세요.');
      setIsSuccess(false);
      return;
    }

    // 이메일 인증 여부 검사
    if (!isEmailVerified) {
        setResponseMessage('이메일 인증을 완료해주세요.');
        setIsSuccess(false);
        return;
    }


    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, { // URL 수정
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
        
        router.push('/login');
      } else {
        const errorData = await response.json();
        setIsSuccess(false);
        setResponseMessage(`회원가입 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('회원가입 요청 중 에러 발생:', error);
      setIsSuccess(false);
      setResponseMessage('회원가입 요청 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            ID
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isUsernameDisabled} // 비활성화 상태 적용
            className={`w-full mt-1 p-2 border border-gray-300 rounded ${isUsernameDisabled ? 'bg-gray-100' : ''}`} // 비활성화 시 배경색 변경
            placeholder="예: userid123"
          />
          <button
            type="button"
            onClick={handleCheckUsername}
            disabled={isUsernameDisabled || !formData.username} // 이미 확인했거나 ID가 없으면 비활성화
            className="mt-2 px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
          >
            중복 확인
          </button>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="예: example@email.com"
            disabled={isEmailVerified || isEmailSent} // 인증 완료 또는 전송 후 비활성화
            className={`w-full mt-1 p-2 border border-gray-300 rounded ${isEmailVerified || isEmailSent ? 'bg-gray-100' : ''}`}
          />
          <button
            type="button"
            onClick={handleSendVerificationEmail}
            disabled={!formData.email || isEmailVerified || isEmailSent || isSendingEmail} // 이메일 없거나, 인증 완료, 이미 보냈거나, 보내는 중이면 비활성화
            className="mt-2 px-4 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
          >
            {isSendingEmail ? '전송 중...' : '인증 메일 전송'}
          </button>
          {/* 이메일 관련 메시지 표시 */}
          {emailResponseMessage && (
            <div className={`mt-2 text-sm ${isEmailSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {emailResponseMessage}
            </div>
          )}
          {/* 인증 코드 입력 필드 (이메일 전송 후 표시) */}
          {isEmailSent && (
            <div className="mt-4">
              <label htmlFor="emailVerificationCode" className="block text-sm font-medium">
                인증 코드
              </label>
              <input
                type="text"
                id="emailVerificationCode"
                name="emailVerificationCode"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value)} // 직접 상태 업데이트
                required
                disabled={isEmailVerified || isVerifyingEmail} // 인증 완료 또는 확인 중 비활성화
                className={`w-full mt-1 p-2 border border-gray-300 rounded ${isEmailVerified ? 'bg-gray-100' : ''}`}
                placeholder="이메일로 받은 인증 코드를 입력하세요"
              />
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={!emailVerificationCode || isEmailVerified || isVerifyingEmail} // 코드 없거나, 인증 완료, 확인 중이면 비활성화
                className="mt-2 px-4 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-300"
              >
                {isVerifyingEmail ? '확인 중...' : '인증 확인'}
              </button>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            이름
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder="예: 홍길동"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium">
            전화번호
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder="예: 010-1234-5678"
          />
        </div>
        <button
          type="submit"
          disabled={!isUsernameChecked || !isEmailVerified} // ID 중복 확인 및 이메일 인증 완료 필요
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:bg-gray-300"
        >
          회원가입
        </button>
      </form>
      {responseMessage && (
        <div
          className={`mt-4 p-3 rounded ${
            isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {responseMessage}
        </div>
      )}
    </div>
  );
}
