import React from 'react';
import {
  GraduationCap,
  Settings,
  CreditCard,
  Award,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldAlert,
  X,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavView } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, t, isRtl, currentUser } = useApp();

  const navItems: { id: NavView; label: string; icon: React.FC<{ className?: string }>; badge?: string; section?: string }[] = [
    {
      id: 'teacherClass',
      label: t.nav.teachersClasses,
      icon: GraduationCap,
      badge: 'Core',
      section: 'Core Management',
    },
    {
      id: 'systemSetup',
      label: t.nav.systemSetup,
      icon: Settings,
      badge: 'Admin',
      section: 'Core Management',
    },
    {
      id: 'receptionDesk',
      label: t.nav.receptionDesk,
      icon: CreditCard,
      badge: 'Fast Desk',
      section: 'Operations & Desk',
    },
    {
      id: 'teacherSettlements',
      label: t.nav.teacherSettlements,
      icon: Award,
      badge: 'Finance',
      section: 'Operations & Desk',
    },
    {
      id: 'studentsEnrollment',
      label: t.nav.studentsEnrollment,
      icon: Users,
      section: 'Academic & Scheduling',
    },
    {
      id: 'classSchedules',
      label: t.nav.classSchedules,
      icon: Calendar,
      section: 'Academic & Scheduling',
    },
    {
      id: 'expensesManager',
      label: t.nav.expensesManager,
      icon: DollarSign,
      section: 'Financial & Analytics',
    },
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: TrendingUp,
      section: 'Financial & Analytics',
    },
    {
      id: 'reportsCenter',
      label: t.nav.reportsCenter,
      icon: FileText,
      section: 'Governance & Audits',
    },
    {
      id: 'auditTrail',
      label: t.nav.auditTrail,
      icon: ShieldAlert,
      section: 'Governance & Audits',
    },
  ];

  const handleNavClick = (view: NavView) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer / Permanent Panel */}
      <aside
        className={`fixed top-16 bottom-0 z-40 w-64 bg-slate-950 border-e border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isRtl ? 'right-0' : 'left-0'} print:hidden`}
      >
        {/* Navigation Items List */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ERP Navigation</span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const showSection = index === 0 || navItems[index - 1].section !== item.section;

              return (
                <React.Fragment key={item.id}>
                  {showSection && (
                    <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.section}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                          isActive
                            ? 'bg-cyan-900 text-cyan-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Bottom System Status Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-300">System Online</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
              v2.6 Enterprise
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
