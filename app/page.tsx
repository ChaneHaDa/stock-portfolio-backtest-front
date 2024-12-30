// app/page.tsx
import React from 'react';

const Home = async () => {
  const kospiIndex = await fetch('http://localhost:8080/api/v1/index/코스피/price')
    .then((res) => res.json())
    .then((data) => data.closePrice)
    .catch(() => '데이터를 가져오지 못했습니다.');

  return (
    <div className="flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/path/to/your/image.jpg')" }}>
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800">현재 코스피 지수</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-600">{kospiIndex}</p>
      </div>
    </div>
  );
};

export default Home;