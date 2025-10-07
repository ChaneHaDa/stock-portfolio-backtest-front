# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js dev server with Turbopack for fast development
- **Build**: `npm run build` - Builds the production application
- **Production server**: `npm run start` - Starts the production server 
- **Lint**: `npm run lint` - Runs ESLint to check code quality
- **Install dependencies**: `npm install`
- **Tests**: `npm test` - Runs all tests
- **Test watch mode**: `npm run test:watch` - Runs tests in watch mode for development
- **Test coverage**: `npm run test:coverage` - Runs tests with coverage report

## Project Architecture

This is a Next.js 15.1.1 frontend application for stock portfolio management and backtesting, written in TypeScript with Tailwind CSS for styling.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: JWT tokens stored in localStorage

### Application Structure

**Core Pages**:
- `/` - Home page with market data and authentication-based navigation
- `/login` & `/register` - User authentication
- `/portfolio` - Portfolio listing and management
- `/portfolio/[id]` - Portfolio details
- `/portfolio/[id]/edit` - Portfolio editing
- `/backtest` - Portfolio backtesting interface
- `/backtest/result` - Backtest results visualization

**Key Components**:
- `Header.tsx` - Navigation with authentication-aware menu
- `BacktestResult.tsx` - Complex results visualization with charts and portfolio management

**Configuration**:
- `config/apiConfig.ts` - API base URL configuration (`API_BASE_URL`)
- TypeScript paths configured with `@/*` alias for root directory

### API Integration

- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` environment variable (defaults to `http://localhost:8080/api/v1`)
- **Authentication**: Bearer token authentication using localStorage
- **External APIs**: Alpha Vantage API for market data (requires `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY`)

### State Management Patterns

**Authentication State**:
- Token stored in localStorage as "accessToken"
- Authentication state managed in Header and page components using useEffect

**Data Flow**:
- Backtest results stored in sessionStorage as "backtestResult"
- Portfolio edit data stored in sessionStorage as "updatedPortfolioData"
- Modal states managed with local component state

### Key Features

**Portfolio Management**:
- CRUD operations on portfolios with authentication
- Portfolio composition with stock search functionality
- Weight validation (must sum to 100%)

**Backtesting**:
- Date range selection (month inputs)
- Portfolio composition with stock search modal
- Results visualization with Recharts (line charts, pie charts)
- Save/update functionality for authenticated users

**Data Visualization**:
- Monthly return charts with responsive design
- Portfolio composition pie charts
- Performance comparison tables

### Development Notes

- Uses "use client" directive for client-side components with state
- Korean language UI with proper formatting for currency and dates
- Responsive design with Tailwind CSS grid system
- Error handling with try/catch blocks and user alerts
- Loading states for async operations

## Testing

The project uses Jest and React Testing Library for comprehensive testing:

**Test Structure**:
- `__tests__/utils/` - Utility function unit tests
- `__tests__/hooks/` - Custom hook tests
- `__tests__/components/` - Component tests
- `__tests__/integration/` - Workflow integration tests
- `__tests__/utils/test-utils.tsx` - Testing utilities and mocks

**Key Features**:
- Custom render function with provider wrapper
- Mock data generators for portfolios, stocks, and backtest results
- Router mocking for Next.js navigation
- API call mocking with fetch interceptors
- Coverage reporting with 70% threshold
- Integration tests for complete user workflows

**Mock Setup**:
- localStorage/sessionStorage mocked globally
- Next.js router mocked in test-utils
- API calls mocked with custom utilities
- Recharts components mocked to avoid canvas issues