"use client";

import { ToastState } from "./types";

interface ToastNotificationProps {
  toast: ToastState;
  onClose: () => void;
}

const ToastNotification = ({ toast, onClose }: ToastNotificationProps) => {
  if (!toast.show) return null;

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 animate-slide-up" role="status" aria-live="polite">
        <div
          className={`
            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md
            ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400/50 text-white"
                : "bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400/50 text-white"
            }
          `}
        >
          <div className="p-2 rounded-full bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {toast.type === "success" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-sm">{toast.type === "success" ? "성공" : "오류"}</p>
            <p className="text-sm opacity-95">{toast.message}</p>
          </div>

          <button onClick={onClose} aria-label="알림 닫기" className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ToastNotification;
