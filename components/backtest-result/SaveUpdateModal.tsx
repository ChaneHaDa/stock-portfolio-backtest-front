"use client";

import { FormEvent, useEffect, useState } from "react";
import { SaveUpdateData } from "./types";

interface SaveUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: SaveUpdateData) => Promise<void>;
  isLoading: boolean;
  isUpdateMode: boolean;
  initialName?: string;
  initialDescription?: string;
}

const SaveUpdateModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isUpdateMode,
  initialName = "",
  initialDescription = "",
}: SaveUpdateModalProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [isOpen, initialName, initialDescription]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    try {
      await onConfirm({ name, description });
    } catch (error) {
      console.error("Save/Update Modal Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-update-modal-title"
    >
      <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-2xl w-full max-w-md p-8 m-4 border-2 border-primary-200 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary-300/20 rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isUpdateMode ? "bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200" : "bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-200"} shadow-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isUpdateMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                </svg>
              </div>
              <h2 id="save-update-modal-title" className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                {isUpdateMode ? "포트폴리오 수정" : "백테스트 저장"}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="저장/수정 모달 닫기"
              className="text-secondary-400 hover:text-secondary-600 transition-all p-2 hover:bg-secondary-100/50 rounded-2xl group"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-bold text-secondary-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                포트폴리오 이름 <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 2025년 성장주 포트폴리오"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border-2 border-primary-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all placeholder:text-secondary-400"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-primary-400/5 to-primary-400/0 pointer-events-none"></div>
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="description" className="block text-sm font-bold text-secondary-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                설명 <span className="text-secondary-400 font-normal text-xs ml-2">(선택사항)</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="이 포트폴리오의 투자 전략이나 특징을 간단히 설명해주세요"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur border-2 border-primary-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 h-24 resize-none transition-all placeholder:text-secondary-400"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-primary-400/5 to-primary-400/0 pointer-events-none"></div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-secondary-600 bg-white/80 backdrop-blur border-2 border-secondary-200 rounded-2xl hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200 font-semibold flex items-center gap-2 shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 text-white rounded-2xl transition-all duration-200 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isUpdateMode
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리 중...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isUpdateMode ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      )}
                    </svg>
                    {isUpdateMode ? "수정 완료" : "저장하기"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveUpdateModal;
