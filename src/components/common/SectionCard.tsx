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
        <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 ${headerClassName}`}>
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-slate-700">{icon}</span>}
            <div>
              <div className="flex items-center gap-2">
                {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
                {badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200/80 text-slate-700">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
