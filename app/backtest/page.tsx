// app/backtest/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/config/apiConfig";

interface PortfolioItem {
  stockName: string;
  weight: string;
}

const PortfolioForm = () => {
  const [startDate, setStartDate] = useState("2020-01");
  const [endDate, setEndDate] = useState("2024-01");
  const [amount, setAmount] = useState("100000"); // 투자금액 상태 추가 (문자열로 입력받고 숫자로 변환)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([{ stockName: "삼성전자", weight: "1" }]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedStartDate = `${startDate}-01`;
    const formattedEndDate = `${endDate}-01`;

    const response = await fetch(API_BASE_URL + '/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        amount: Number(amount), // 문자열을 숫자로 변환하여 전송
        portfolioRequestItemDTOList: portfolioItems.map(item => ({
          stockName: item.stockName,
          weight: parseFloat(item.weight),
        })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem('backtestResult', JSON.stringify(data.data));
      router.push('/backtest/result');
    } else {
      console.error('API 호출 오류:', response.statusText);
    }
  };

  const handleChange = (index: number, field: keyof PortfolioItem, value: string) => {
    const newPortfolioItems = [...portfolioItems];
    newPortfolioItems[index][field] = value;
    setPortfolioItems(newPortfolioItems);
  };

  const addPortfolioItem = () => {
    setPortfolioItems([...portfolioItems, { stockName: "", weight: "0" }]);
  };

  const removePortfolioItem = (index: number) => {
    const newPortfolioItems = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(newPortfolioItems);
  };

  return (
    <div className="bg-white h-full w-full rounded-lg p-4 items-center justify-center m-auto max-w-[960px]">
      <div className="p-4">포트폴리오 백테스트</div>
      <form className="p-4 w-full" onSubmit={handleSubmit}>
        <div>
          <div className="mb-4 flex items-center">
            <label htmlFor="startDate" className="text-lg font-semibold mr-4 whitespace-nowrap">
              시작 날짜
            </label>
            <input
              type="month"
              id="startDate"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4 flex items-center">
            <label htmlFor="endDate" className="text-lg font-semibold mr-4 whitespace-nowrap">
              종료 날짜
            </label>
            <input
              type="month"
              id="endDate"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4 flex items-center">
            <label htmlFor="amount" className="text-lg font-semibold mr-4 whitespace-nowrap">
              투자 금액
            </label>
            <input
              type="number"
              id="amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <hr className="mx-auto border-gray-300" />

        <div className="mb-4">
          {portfolioItems.map((item, index) => (
            <div key={index} className="mb-4 my-3 flex items-center w-full">
              <label htmlFor={`stockName-${index}`} className="text-lg font-semibold mr-4 whitespace-nowrap">
                자산 {index + 1}
              </label>
              <input
                type="text"
                id={`stockName-${index}`}
                required
                value={item.stockName}
                onChange={(e) => handleChange(index, 'stockName', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-[70%] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                id={`weight-${index}`}
                min="0"
                max="1"
                step="0.01"
                required
                value={item.weight}
                onChange={(e) => handleChange(index, 'weight', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 mx-3 w-[10%] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removePortfolioItem(index)}
                className="ml-2 bg-red-300 text-white p-2 rounded-lg hover:bg-red-400 transition duration-200"
              >
                삭제
              </button>
            </div>
          ))}

          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={addPortfolioItem}
              className="w-28 bg-gray-500 text-white p-1 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              자산 추가
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <button type="submit" className="w-28 bg-gray-500 text-white p-1 rounded-lg hover:bg-gray-600 transition duration-200">
            백테스트
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
