import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon | React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'navy' | 'cyan' | 'emerald' | 'amber' | 'slate';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'navy',
  onClick,
}) => {
  const variantStyles = {
    navy: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      text: 'text-white',
      valueText: 'text-cyan-400',
      subText: 'text-slate-400',
      iconBg: 'bg-slate-800 text-cyan-400',
    },
    cyan: {
      bg: 'bg-cyan-950',
      border: 'border-cyan-800',
      text: 'text-white',
      valueText: 'text-cyan-300',
      subText: 'text-cyan-200/70',
      iconBg: 'bg-cyan-900 text-cyan-300',
    },
    emerald: {
      bg: 'bg-emerald-950',
      border: 'border-emerald-800',
      text: 'text-white',
      valueText: 'text-emerald-400',
      subText: 'text-emerald-200/70',
      iconBg: 'bg-emerald-900 text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-950',
      border: 'border-amber-800',
      text: 'text-white',
      valueText: 'text-amber-400',
      subText: 'text-amber-200/70',
      iconBg: 'bg-amber-900 text-amber-300',
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-900',
      valueText: 'text-slate-900',
      subText: 'text-slate-500',
      iconBg: 'bg-slate-100 text-slate-700',
    },
  };

  const style = variantStyles[variant];

  // Helper to render icon whether it's passed as a LucideIcon component type (e.g. icon={DollarSign}) or a JSX ReactNode (e.g. icon={<GraduationCap className="..." />})
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 transition-all ${style.bg} ${style.border} ${
        onClick ? 'cursor-pointer hover:shadow-md' : 'shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${style.subText}`}>{title}</span>
        <div className={`p-2.5 rounded-lg shrink-0 ${style.iconBg}`}>
          {renderIcon()}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.valueText}`}>
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className={`mt-1.5 text-xs ${style.subText}`}>{subtitle}</p>}
    </div>
  );
};
