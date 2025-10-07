import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// This is a utility file, not a test file
// Add a dummy test to satisfy Jest's requirement
describe('Test utilities', () => {
  it('should export testing utilities', () => {
    expect(typeof render).toBe('function')
    expect(typeof createMockPortfolio).toBe('function')
  })
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

// Setup router mock before each test
beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter)
  Object.values(mockRouter).forEach(fn => fn.mockClear())
})

// Custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data generators
export const createMockPortfolio = (overrides = {}) => ({
  id: 1,
  name: 'Test Portfolio',
  description: 'Test Description',
  amount: 100000,
  startDate: '2020-01-01',
  endDate: '2024-01-01',
  ror: 15.5,
  volatility: 12.3,
  price: 115500,
  ...overrides,
})

export const createMockStock = (overrides = {}) => ({
  stockId: 1,
  name: 'Test Stock',
  shortCode: 'TEST',
  marketCategory: 'KOSPI',
  ...overrides,
})

export const createMockBacktestResult = (overrides = {}) => ({
  totalRor: 15.5,
  totalAmount: 115500,
  volatility: 12.3,
  monthlyRor: {
    '2020-01': 2.5,
    '2020-02': -1.2,
    '2020-03': 3.1,
  },
  portfolioInput: {
    startDate: '2020-01-01',
    endDate: '2024-01-01',
    amount: 100000,
    portfolioBacktestRequestItemDTOList: [
      {
        stockId: 1,
        stockName: 'Test Stock',
        weight: 1.0,
      },
    ],
  },
  portfolioBacktestResponseItemDTOList: [
    {
      name: 'Test Stock',
      totalRor: 15.5,
      monthlyRor: {
        '2020-01': 2.5,
        '2020-02': -1.2,
        '2020-03': 3.1,
      },
    },
  ],
  ...overrides,
})

// Mock API responses
export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  status: 'success',
  code: null,
  message: null,
  data,
  ...overrides,
})

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock fetch response
export const createMockFetchResponse = <T>(data: T, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response)
}