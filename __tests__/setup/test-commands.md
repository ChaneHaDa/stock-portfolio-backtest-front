# 테스트 실행 가이드

## 테스트 명령어

### 전체 테스트 실행
```bash
npm test
```

### 테스트 감시 모드 (개발용)
```bash
npm run test:watch
```

### 커버리지 리포트와 함께 실행
```bash
npm run test:coverage
```

### 특정 테스트 파일만 실행
```bash
npm test -- formatters.test.ts
```

### 특정 테스트 스위트만 실행
```bash
npm test -- --testNamePattern="formatPercentage"
```

## 테스트 구조

### 단위 테스트 (Unit Tests)
- `__tests__/utils/` - 유틸리티 함수 테스트
- `__tests__/hooks/` - 커스텀 훅 테스트

### 컴포넌트 테스트 (Component Tests)
- `__tests__/components/` - 개별 컴포넌트 테스트

### 통합 테스트 (Integration Tests)
- `__tests__/integration/` - 워크플로우 및 기능 통합 테스트

## 테스트 커버리지 목표

현재 설정된 커버리지 임계값:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 테스트 작성 가이드

### 1. 테스트 파일 명명 규칙
- 단위 테스트: `[filename].test.ts`
- 컴포넌트 테스트: `[ComponentName].test.tsx`
- 통합 테스트: `[feature-name]-workflow.test.tsx`

### 2. 테스트 구조
```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // 테스트 전 설정
  })

  it('should describe what it does', () => {
    // 테스트 코드
  })
})
```

### 3. Mock 사용법
```typescript
// API 호출 Mock
jest.mock('@/utils/api', () => ({
  apiCall: jest.fn(),
}))

// React Hook Mock
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))
```

### 4. 비동기 테스트
```typescript
it('should handle async operations', async () => {
  // async/await 사용
  await waitFor(() => {
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 주요 테스트 유틸리티

### 커스텀 렌더 함수
```typescript
import { render } from '../utils/test-utils'
```

### 목 데이터 생성
```typescript
import { 
  createMockPortfolio, 
  createMockBacktestResult,
  createMockApiResponse 
} from '../utils/test-utils'
```

### 라우터 목킹
```typescript
import { mockRouter } from '../utils/test-utils'
// mockRouter.push, mockRouter.replace 등 사용 가능
```

## 테스트 디버깅

### 디버그 정보 출력
```typescript
import { screen } from '@testing-library/react'

// 현재 DOM 구조 출력
screen.debug()

// 특정 요소만 출력
screen.debug(screen.getByTestId('specific-element'))
```

### 쿼리 실패 시 유용한 명령어
```typescript
// 존재하지 않는 요소 찾기
screen.getByRole('button', { name: /search/i })

// 가능한 역할들 확인
screen.logTestingPlaygroundURL()
```

## CI/CD 통합

GitHub Actions 등에서 테스트 실행:
```yaml
- name: Run tests
  run: npm test -- --coverage --watchAll=false
```

## 문제 해결

### 자주 발생하는 문제들

1. **Canvas/Chart 관련 에러**: Recharts 컴포넌트는 mock으로 처리
2. **localStorage/sessionStorage**: jest.setup.js에서 mock 설정됨
3. **fetch API**: global.fetch mock 사용
4. **Next.js Router**: test-utils.tsx에서 mock 설정됨