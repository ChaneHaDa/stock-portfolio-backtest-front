import {
  formatPercentage,
  formatCurrency,
  formatNumber,
  formatDate,
  validateEmail,
  validatePassword,
  validatePortfolioWeights,
} from '@/utils/formatters'

describe('formatters', () => {
  describe('formatPercentage', () => {
    it('should format positive percentages with + sign', () => {
      expect(formatPercentage(15.5)).toBe('+15.50%')
      expect(formatPercentage(0.1)).toBe('+0.10%')
    })

    it('should format negative percentages without + sign', () => {
      expect(formatPercentage(-10.25)).toBe('-10.25%')
    })

    it('should format zero without + sign', () => {
      expect(formatPercentage(0)).toBe('0.00%')
    })

    it('should round to 2 decimal places', () => {
      expect(formatPercentage(15.556)).toBe('+15.56%')
      expect(formatPercentage(-10.255)).toBe('-10.26%')
    })
  })

  describe('formatCurrency', () => {
    it('should format KRW currency by default', () => {
      expect(formatCurrency(100000)).toBe('₩100,000')
    })

    it('should format with custom locale and currency', () => {
      expect(formatCurrency(100000, 'en-US', 'USD')).toBe('$100,000.00')
    })

    it('should handle decimal amounts', () => {
      expect(formatCurrency(1000.50)).toBe('₩1,001') // KRW rounds to nearest integer
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with default 2 decimal places', () => {
      expect(formatNumber(15.556)).toBe('15.56')
      expect(formatNumber(10)).toBe('10.00')
    })

    it('should format numbers with custom decimal places', () => {
      expect(formatNumber(15.555, 1)).toBe('15.6')
      expect(formatNumber(15.555, 0)).toBe('16')
    })
  })

  describe('formatDate', () => {
    it('should format valid date strings', () => {
      const result = formatDate('2023-12-25')
      expect(result).toMatch(/2023/) // Should contain year
    })

    it('should return original string for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date')
      expect(formatDate('')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.kr')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongP@ss123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1A')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('비밀번호는 8자 이상이어야 합니다.')
    })

    it('should require lowercase letters', () => {
      const result = validatePassword('PASSWORD123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('소문자를 포함해야 합니다.')
    })

    it('should require uppercase letters', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('대문자를 포함해야 합니다.')
    })

    it('should require numbers', () => {
      const result = validatePassword('PasswordOnly')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('숫자를 포함해야 합니다.')
    })

    it('should collect multiple errors', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('validatePortfolioWeights', () => {
    it('should validate weights that sum to 100%', () => {
      const result = validatePortfolioWeights([50, 30, 20])
      expect(result.isValid).toBe(true)
      expect(result.total).toBe(100)
      expect(result.error).toBeUndefined()
    })

    it('should reject weights that do not sum to 100%', () => {
      const result = validatePortfolioWeights([50, 30, 15])
      expect(result.isValid).toBe(false)
      expect(result.total).toBe(95)
      expect(result.error).toContain('가중치 합계는 100%가 되어야 합니다')
    })

    it('should handle empty array', () => {
      const result = validatePortfolioWeights([])
      expect(result.isValid).toBe(false)
      expect(result.total).toBe(0)
    })

    it('should handle floating point precision', () => {
      const result = validatePortfolioWeights([33.33, 33.33, 33.34])
      expect(result.isValid).toBe(true) // Should be within tolerance
      expect(result.total).toBe(100)
    })
  })
})