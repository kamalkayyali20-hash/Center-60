import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] sm:text-xs text-slate-500 mb-1.5 sm:mb-2 overflow-x-auto scrollbar-none">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300">/</span>}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="hover:text-cyan-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-700 font-medium whitespace-nowrap">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          {Icon && (
            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900 text-cyan-400 shrink-0 shadow-xs">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 max-w-3xl leading-snug sm:leading-relaxed">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
