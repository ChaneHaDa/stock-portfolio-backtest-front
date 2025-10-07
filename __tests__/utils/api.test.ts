import { apiCall, authenticatedApiCall, ApiError } from '@/utils/api'

// Mock the API_BASE_URL
jest.mock('@/config/apiConfig', () => ({
  API_BASE_URL: 'http://localhost:8080/api/v1'
}))

describe('api utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('apiCall', () => {
    it('should make successful API calls', async () => {
      const mockData = { status: 'success', data: { id: 1, name: 'test' } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await apiCall('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'accept': '*/*',
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Resource not found' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);

      expect.assertions(2);
      try {
        await apiCall('/nonexistent');
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect(e.message).toBe('Resource not found');
      }
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      expect.assertions(2);
      try {
        await apiCall('/test');
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect(e.message).toBe('네트워크 오류가 발생했습니다.');
      }
    });
  })

  describe('authenticatedApiCall', () => {
    const mockToken = 'test-jwt-token'

    it('should add authorization header', async () => {
      const mockData = { status: 'success', data: {} }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      await authenticatedApiCall('/protected', mockToken)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'accept': '*/*',
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  describe('ApiError', () => {
    it('should create ApiError with message', () => {
      const error = new ApiError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('ApiError')
      expect(error instanceof Error).toBe(true)
    })

    it('should create ApiError with status and response', () => {
      const mockResponse = { error: 'details' }
      const error = new ApiError('Test error', 404, mockResponse)
      
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(404)
      expect(error.response).toBe(mockResponse)
    })
  })
})