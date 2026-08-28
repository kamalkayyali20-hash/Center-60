import React from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  badge,
  icon,
  headerAction,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className={`px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-50/70 ${headerClassName}`}>
          <div className="flex items-center gap-2 sm:gap-2.5">
            {icon && <span className="text-slate-700 shrink-0">{icon}</span>}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {title && <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{title}</h3>}
                {badge && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-slate-200/80 text-slate-700 shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="w-full sm:w-auto shrink-0 overflow-x-auto">{headerAction}</div>}
        </div>
      )}
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  );
};
