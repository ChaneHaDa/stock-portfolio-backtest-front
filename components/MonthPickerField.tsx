import React, { useMemo, useState } from "react";

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

const parseMonth = (value: string): { year: number; month: number } | null => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  return { year, month };
};

const toComparable = (value: string): number | null => {
  const parsed = parseMonth(value);
  if (!parsed) {
    return null;
  }
  return parsed.year * 100 + parsed.month;
};

const inRange = (value: string, min?: string, max?: string): boolean => {
  const current = toComparable(value);
  const minValue = min ? toComparable(min) : null;
  const maxValue = max ? toComparable(max) : null;

  if (current === null) {
    return false;
  }
  if (minValue !== null && current < minValue) {
    return false;
  }
  if (maxValue !== null && current > maxValue) {
    return false;
  }
  return true;
};

const formatValue = (year: number, month: number): string => `${year}-${String(month).padStart(2, "0")}`;

interface MonthPickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
}

const MonthPickerField: React.FC<MonthPickerFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  min,
  max,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(() => parseMonth(value), [value]);
  const nowYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState<number>(selected?.year ?? nowYear);

  const minYear = min ? parseMonth(min)?.year : undefined;
  const maxYear = max ? parseMonth(max)?.year : undefined;

  const labelValue = selected ? `${selected.year}년 ${selected.month}월` : "선택";

  const open = () => {
    const current = parseMonth(value);
    setViewYear(current?.year ?? nowYear);
    setIsOpen(true);
  };

  return (
    <>
      <label htmlFor={id} className="block text-secondary-700 font-medium mb-2">
        {label}
      </label>
      <input id={id} type="hidden" value={value} required={required} readOnly />

      <button
        type="button"
        onClick={open}
        className="w-full border border-primary-300 rounded-lg p-3 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
      >
        <span className="text-secondary-800">{labelValue}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-month-dialog-title`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id={`${id}-month-dialog-title`} className="text-lg font-semibold text-secondary-800">
                {label} 선택
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-secondary-500 hover:bg-secondary-100"
                aria-label="월 선택 닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewYear((prev) => prev - 1)}
                disabled={typeof minYear === "number" && viewYear <= minYear}
                className="rounded-md px-2 py-1 text-secondary-600 hover:bg-secondary-100 disabled:text-secondary-300 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <p className="text-base font-semibold text-secondary-800">{viewYear}년</p>
              <button
                type="button"
                onClick={() => setViewYear((prev) => prev + 1)}
                disabled={typeof maxYear === "number" && viewYear >= maxYear}
                className="rounded-md px-2 py-1 text-secondary-600 hover:bg-secondary-100 disabled:text-secondary-300 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((monthLabel, index) => {
                const month = index + 1;
                const nextValue = formatValue(viewYear, month);
                const disabled = !inRange(nextValue, min, max);
                const selectedMonth = nextValue === value;

                return (
                  <button
                    key={monthLabel}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(nextValue);
                      setIsOpen(false);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedMonth
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                    } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthPickerField;
