"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/apiConfig';
import { ApiResponse, StockSearchResult } from '@/types/stock';

const StocksPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`${API_BASE_URL}/stocks?q=${encodeURIComponent(searchQuery)}`);

      // 404는 검색 결과 없음으로 처리
      if (response.status === 404) {
        setSearchResults([]);
        setHasSearched(true);
        return;
      }

      const result: ApiResponse<StockSearchResult[]> = await response.json();

      if (result.status === 'success') {
        setSearchResults(result.data || []);
        setHasSearched(true);
      } else {
        alert('검색 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Stock search error:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStockClick = (stockId: number) => {
    router.push(`/stocks/${stockId}`);
  };

  return (
    <div className="page-shell">
      <div className="page-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-800 mb-4">주식 정보</h1>
        <p className="text-lg text-secondary-600">
          종목명 또는 종목코드로 검색해보세요.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="종목명 또는 종목코드 입력 (예: 삼성전자, 005930)"
            className="field-input flex-1 py-3"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="btn-primary px-6 py-3 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </form>
      </div>

      {isSearching && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-lg text-secondary-600">검색 중...</span>
        </div>
      )}

      {!isSearching && hasSearched && (
        <div className="max-w-4xl mx-auto">
          {searchResults.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="text-lg text-secondary-600">검색 결과가 없습니다.</p>
              <p className="text-sm text-secondary-500 mt-2">다른 검색어를 입력해보세요.</p>
            </div>
          ) : (
            <div className="panel overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <h2 className="text-2xl font-bold">검색 결과 ({searchResults.length}개)</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {searchResults.map((stock) => (
                  <button
                    key={stock.stockId}
                    type="button"
                    onClick={() => handleStockClick(stock.stockId)}
                    className="w-full p-6 text-left hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-inset"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-secondary-800">{stock.name}</h3>
                        <p className="text-sm text-secondary-600 mt-1">종목코드: {stock.shortCode}</p>
                      </div>
                      <div className="sm:text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          stock.marketCategory === 'KOSPI'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {stock.marketCategory}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default StocksPage;
