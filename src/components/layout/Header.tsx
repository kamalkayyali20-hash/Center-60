import React, { useState, useRef, useEffect } from 'react';
import {
  Languages,
  UserCheck,
  Shield,
  Menu,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  RefreshCw,
  Edit2,
  Lock,
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
    isUserLoggedIn,
    users,
    switchActiveAccount,
    openAuthModal,
    openAccountsControlModal,
    logoutUser,
    setCurrentView,
    isRtl,
    t,
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSwitchList, setShowSwitchList] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
        setShowSwitchList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'CEO':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ACCOUNTANT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'TEACHER':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const userInitials = (currentUser?.fullName || currentUser?.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Mobile Menu Toggle & App Branding */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer"
            onClick={() => setCurrentView('teachersDashboard')}
            title="60 Center"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-sm sm:text-base shadow-sm shrink-0">
              60
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-white whitespace-nowrap">
                  60 CENTER
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {isRtl ? 'سنتر تعليمي' : 'Education Center'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden lg:block font-medium">
                {isRtl ? 'نظام إدارة مراكز الدروس الخصوصية المتكامل' : 'Comprehensive Education Center Management'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Language Switcher & Logged-In User Name Display */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Single Language Toggle Button */}
          <button
            type="button"
            onClick={() => setLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Switch Language / تغيير اللغة"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentLanguage === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Authentication State: Show Signed-in User Name if Logged in, or Login button if logged out */}
          {isUserLoggedIn && currentUser ? (
            /* Logged In: Displays the signed-in user's name & dropdown */
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((prev) => !prev);
                  setShowSwitchList(false);
                }}
                className="px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs max-w-[160px] xs:max-w-[200px] sm:max-w-[260px]"
                title={currentUser.fullName}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 font-black text-[11px] sm:text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {userInitials}
                </div>
                <div className="flex flex-col text-start truncate">
                  <span className="text-white font-bold truncate text-xs leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[9px] text-cyan-300 font-mono hidden sm:inline leading-none mt-0.5">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Account Settings & Controls Dropdown */}
              {userMenuOpen && (
                <div className={`absolute top-full mt-2 w-64 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 ${isRtl ? 'left-0' : 'right-0'}`}>
                  {/* Active Account Info Header */}
                  <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 mx-2 rounded-xl mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {isRtl ? 'الحساب المسجل حالياً' : 'Signed-In Account'}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm truncate mt-1">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {currentUser.email}
                    </div>
                    {currentUser.phoneNumber && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {currentUser.phoneNumber}
                      </div>
                    )}
                  </div>

                  {/* Primary Action: Open Account Control Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      openAccountsControlModal();
                    }}
                    className="w-full text-start px-4 py-2.5 hover:bg-slate-800 text-white font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="flex flex-col">
                      <span>{isRtl ? 'إعدادات والتحكم بالحسابات' : 'Account Control & Settings'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {isRtl ? 'إدارة الموظفين، تبديل الجلسات، الصلاحيات' : 'Manage accounts, sessions & roles'}
                      </span>
                    </div>
                  </button>

                  {/* Secondary Action: Quick Switch Account */}
                  <button
                    type="button"
                    onClick={() => setShowSwitchList((prev) => !prev)}
                    className="w-full text-start px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isRtl ? 'تبديل الحساب النشط' : 'Switch Active Account'}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSwitchList ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Quick Switch Accounts List (Embedded) */}
                  {showSwitchList && (
                    <div className="px-2 py-1 space-y-1 bg-slate-950/60 rounded-xl mx-2 my-1 max-h-40 overflow-y-auto">
                      {users.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              switchActiveAccount(u.id);
                              setUserMenuOpen(false);
                              setShowSwitchList(false);
                            }}
                            className={`w-full text-start px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="truncate flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                              <span className="truncate">{u.fullName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{u.role}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Action: Add Employee */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="w-full text-start px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isRtl ? 'إضافة موظف جديد' : 'Register New Employee'}</span>
                  </button>

                  {/* Action: Sign In Another Account */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full text-start px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isRtl ? 'تسجيل الدخول بحساب آخر' : 'Sign In Another Account'}</span>
                  </button>

                  <div className="border-t border-slate-800 my-1.5"></div>

                  {/* Action: Sign Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full text-start px-4 py-2 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out: Show Clean Login / Register Button */
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              title={isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isRtl ? 'دخول / تسجيل' : 'Login / Register'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

