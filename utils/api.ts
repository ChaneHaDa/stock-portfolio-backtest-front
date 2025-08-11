import { API_BASE_URL } from '@/config/apiConfig';

export interface ApiResponse<T = any> {
  status: string;
  code: string | null;
  message: string | null;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'accept': '*/*',
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `API 요청 실패: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 에러 메시지 사용
      }
      throw new ApiError(errorMessage, response.status, response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('네트워크 오류가 발생했습니다.');
  }
};

export const authenticatedApiCall = async <T = any>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return apiCall<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};