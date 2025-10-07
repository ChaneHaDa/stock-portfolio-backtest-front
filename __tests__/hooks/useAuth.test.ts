import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.accessToken).toBe(null)
  })

  it('should authenticate user when token exists in localStorage', () => {
    const mockToken = 'test-jwt-token'
    localStorage.setItem('accessToken', mockToken)

    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.accessToken).toBe(mockToken)
  })

  it('should login user with token', () => {
    const { result } = renderHook(() => useAuth())
    const mockToken = 'new-jwt-token'

    act(() => {
      result.current.login(mockToken)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.accessToken).toBe(mockToken)
    expect(localStorage.getItem('accessToken')).toBe(mockToken)
  })

  it('should logout user and clear token', () => {
    const mockToken = 'test-jwt-token'
    localStorage.setItem('accessToken', mockToken)
    
    const { result } = renderHook(() => useAuth())

    // Initially authenticated
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.accessToken).toBe(null)
    expect(localStorage.getItem('accessToken')).toBe(null)
  })

  it('should check auth state manually', () => {
    const { result } = renderHook(() => useAuth())
    
    // Initially not authenticated
    expect(result.current.isAuthenticated).toBe(false)

    // Add token to localStorage manually
    localStorage.setItem('accessToken', 'manual-token')

    act(() => {
      result.current.checkAuth()
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.accessToken).toBe('manual-token')
  })
})