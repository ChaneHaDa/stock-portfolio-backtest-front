export const formatPercentage = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const formatCurrency = (amount: number, locale: string = "ko-KR", currency: string = "KRW"): string => {
  return new Intl.NumberFormat(locale, { 
    style: "currency", 
    currency: currency 
  }).format(amount);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('ko-KR');
  } catch {
    return dateString;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("비밀번호는 8자 이상이어야 합니다.");
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("소문자를 포함해야 합니다.");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("대문자를 포함해야 합니다.");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("숫자를 포함해야 합니다.");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePortfolioWeights = (weights: number[]): {
  isValid: boolean;
  total: number;
  error?: string;
} => {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const isValid = Math.abs(total - 100) < 0.0001;
  
  return {
    isValid,
    total,
    error: isValid ? undefined : `가중치 합계는 100%가 되어야 합니다. (현재: ${total.toFixed(2)}%)`
  };
};