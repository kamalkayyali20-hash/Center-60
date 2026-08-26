import React from 'react';
import {
  Languages,
  UserCheck,
  Shield,
  Menu,
  Bell,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentLanguage,
    setLanguage,
    currentUser,
    switchUserRole,
    isRtl,
    t,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & App Branding */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              60
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  60 CENTER ERP
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Enterprise Suite
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block font-medium">
                {isRtl ? 'نظام إدارة مراكز الدروس الخصوصية المتكامل' : 'Comprehensive Education Center Enterprise System'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Role Selector & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick RBAC Role Switcher */}
          <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400 me-1.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 leading-none">Simulate Role:</span>
              <select
                value={currentUser?.role || 'ADMIN'}
                onChange={(e) => switchUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer py-0.5 pe-4"
              >
                <option value="ADMIN" className="bg-slate-900 text-white">Admin (Full Access)</option>
                <option value="CEO" className="bg-slate-900 text-white">CEO / Director</option>
                <option value="RECEPTION" className="bg-slate-900 text-white">Reception Desk</option>
                <option value="ACCOUNTANT" className="bg-slate-900 text-white">Accountant</option>
                <option value="TEACHER" className="bg-slate-900 text-white">Teacher</option>
              </select>
            </div>
          </div>

          {/* Language Toggle (EN / AR) */}
          <button
            type="button"
            onClick={() => setLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentLanguage === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 ps-2 border-s border-slate-800">
            <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs">
              {((currentUser?.fullName || currentUser?.username || 'U').substring(0, 2)).toUpperCase()}
            </div>
            <div className="hidden xl:block text-start text-xs">
              <div className="font-semibold text-white leading-tight">
                {currentUser?.fullName || currentUser?.username || 'User'}
              </div>
              <div className="text-[10px] text-slate-400">{currentUser?.role || 'ADMIN'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
