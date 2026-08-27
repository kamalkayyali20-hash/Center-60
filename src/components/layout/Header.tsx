import React, { useState, useRef, useEffect } from 'react';
import {
  Languages,
  UserCheck,
  Shield,
  Menu,
  Bell,
  Sparkles,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User,
  KeyRound,
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
    openAuthModal,
    logoutUser,
    setCurrentView,
    isRtl,
    t,
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setCurrentView('teachersDashboard')}
            title="60 Center"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              60
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  60 CENTER
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {isRtl ? 'سنتر تعليمي' : 'Education Center'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block font-medium">
                {isRtl ? 'نظام إدارة مراكز الدروس الخصوصية المتكامل' : 'Comprehensive Education Center Management System'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Role Selector, Language Switcher & Login/Register */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick RBAC Role Switcher */}
          <div className="hidden sm:flex relative items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
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

          {/* Button beside Language for Login / Register */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title={isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isRtl ? 'دخول / تسجيل' : 'Login / Register'}</span>
              <ChevronDown className="w-3 h-3 ms-0.5 opacity-70" />
            </button>

            {/* Dropdown Menu when clicked */}
            {userMenuOpen && (
              <div className={`absolute top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs ${isRtl ? 'left-0' : 'right-0'}`}>
                <div className="px-3 py-2 border-b border-slate-700/80 mb-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {isRtl ? 'المستخدم الحالي' : 'Active Account'}
                  </div>
                  <div className="font-bold text-white text-xs truncate mt-0.5">
                    {currentUser?.fullName || currentUser?.email || 'Logged In'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                    {currentUser?.role || 'ADMIN'} • {currentUser?.email || ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full text-start px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isRtl ? 'تسجيل الدخول (Sign In)' : 'Sign In with Email'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full text-start px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isRtl ? 'إنشاء حساب جديد (Register)' : 'Register New Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setCurrentView('authPage');
                  }}
                  className="w-full text-start px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRtl ? 'صفحة الدخول والتسجيل الكاملة' : 'Full Login & Register Page'}</span>
                </button>

                <div className="border-t border-slate-700/80 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logoutUser();
                    openAuthModal('login');
                  }}
                  className="w-full text-start px-3 py-2 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isRtl ? 'تسجيل الخروج (Sign Out)' : 'Sign Out / Switch'}</span>
                </button>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div
            className="flex items-center gap-2 ps-1.5 sm:ps-2 border-s border-slate-800 cursor-pointer"
            onClick={() => openAuthModal('login')}
            title={currentUser?.fullName || 'User Profile'}
          >
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
