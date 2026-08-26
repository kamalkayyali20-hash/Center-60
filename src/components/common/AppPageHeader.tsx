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
    <div className="mb-6 pb-4 border-b border-slate-200">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-500 mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="hover:text-cyan-600 transition-colors cursor-pointer"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-700 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          {Icon && (
            <div className="p-2.5 rounded-lg bg-slate-900 text-cyan-400 shrink-0 shadow-xs">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {badge && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};
