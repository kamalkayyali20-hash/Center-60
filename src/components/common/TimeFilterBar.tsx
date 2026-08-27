import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TimeFilterPeriod = 'today' | 'week' | 'month' | 'specific' | 'all';

interface TimeFilterBarProps {
  period: TimeFilterPeriod;
  onPeriodChange: (period: TimeFilterPeriod) => void;
  specificDate: string;
  onSpecificDateChange: (date: string) => void;
  quickStatsSummary?: string;
}

export const TimeFilterBar: React.FC<TimeFilterBarProps> = ({
  period,
  onPeriodChange,
  specificDate,
  onSpecificDateChange,
  quickStatsSummary,
}) => {
  const { isRtl } = useApp();

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Left: Filter Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 me-1">
          <Filter className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>{isRtl ? 'الفترة:' : 'Period:'}</span>
        </div>

        <button
          type="button"
          onClick={() => onPeriodChange('today')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'today'
              ? 'bg-slate-900 text-cyan-400 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isRtl ? 'اليوم (Sysday)' : 'Today (Sysday)'}
        </button>

        <button
          type="button"
          onClick={() => onPeriodChange('week')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'week'
              ? 'bg-slate-900 text-cyan-400 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isRtl ? 'هذا الأسبوع' : 'This Week'}
        </button>

        <button
          type="button"
          onClick={() => onPeriodChange('month')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'month'
              ? 'bg-slate-900 text-cyan-400 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isRtl ? 'هذا الشهر' : 'This Month'}
        </button>

        <button
          type="button"
          onClick={() => onPeriodChange('specific')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'specific'
              ? 'bg-slate-900 text-cyan-400 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isRtl ? 'تاريخ محدد' : 'Specific Date'}
        </button>

        <button
          type="button"
          onClick={() => onPeriodChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'all'
              ? 'bg-slate-900 text-cyan-400 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isRtl ? 'الكل (All Time)' : 'All Time'}
        </button>
      </div>

      {/* Right: Date Picker when 'specific' is active OR Quick Summary */}
      <div className="flex items-center gap-3 justify-between md:justify-end">
        {period === 'specific' ? (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
            <input
              type="date"
              value={specificDate}
              onChange={(e) => onSpecificDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        ) : (
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {period === 'today' && (isRtl ? 'تاريخ اليوم:' : 'Current Sysday:')}
              {period === 'week' && (isRtl ? 'الأيام الـ 7 الأخيرة' : 'Last 7 Days')}
              {period === 'month' && (isRtl ? 'الأيام الـ 30 الأخيرة' : 'Last 30 Days')}
              {period === 'all' && (isRtl ? 'كافة السجلات التاريخية' : 'All Historical Data')}
            </span>
            {period === 'today' && (
              <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                {new Date().toISOString().split('T')[0]}
              </span>
            )}
          </div>
        )}

        {quickStatsSummary && (
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
            {quickStatsSummary}
          </span>
        )}
      </div>
    </div>
  );
};
