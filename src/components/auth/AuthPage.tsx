import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Building2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  isModal = false,
}) => {
  const {
    isRtl,
    loginUser,
    registerUser,
    setCurrentView,
    users,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('RECEPTION');

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Demo Account Selection
  const handleQuickDemoLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setFeedback({ type: null, message: '' });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    if (!loginEmail.trim()) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم.' : 'Please enter your email or username.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginUser(loginEmail, loginPassword);
      setIsSubmitting(false);

      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            setCurrentView('teachersDashboard');
          }
        }, 600);
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    if (!firstName.trim() || !lastName.trim()) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'يرجى إدخال الاسم الأول واسم العائلة.' : 'Please provide both first and last name.',
      });
      return;
    }

    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please provide a valid email address.',
      });
      return;
    }

    if (!phoneNumber.trim()) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'يرجى إدخال رقم الهاتف للتواصل.' : 'Please provide a valid phone number.',
      });
      return;
    }

    if (!registerPassword || registerPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'كلمة المرور يجب أن لا تقل عن 6 خانات.' : 'Password must be at least 6 characters.',
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = registerUser({
        firstName,
        lastName,
        email: registerEmail,
        phoneNumber,
        password: registerPassword,
        role: selectedRole,
      });
      setIsSubmitting(false);

      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            setCurrentView('teachersDashboard');
          }
        }, 700);
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    }, 350);
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'max-w-4xl mx-auto py-4 sm:py-8'}`}>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Center 60 Branding Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-start">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-cyan-500/20 shrink-0">
                60
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {isRtl ? 'سنتر 60' : '60 Center'}
                  </h1>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {isRtl ? 'بوابة الموظفين' : 'Staff Portal'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {mode === 'login'
                    ? isRtl
                      ? 'تسجيل الدخول إلى نظام إدارة مراكز الدروس الخصوصية'
                      : 'Sign in to the Education Center Management System'
                    : isRtl
                    ? 'تسجيل حساب موظف جديد في سنتر 60'
                    : 'Create a new staff member account for 60 Center'}
                </p>
              </div>
            </div>

            {/* Quick Mode Toggle Pills */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFeedback({ type: null, message: '' });
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFeedback({ type: null, message: '' });
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isRtl ? 'إنشاء حساب جديد' : 'Register'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Message */}
        {feedback.message && (
          <div
            className={`p-4 border-b text-sm flex items-center gap-2.5 ${
              feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {mode === 'login' ? (
            /* ======================= LOGIN FORM ======================= */
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-5 max-w-lg mx-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@60center.com"
                      className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {isRtl ? 'كلمة المرور' : 'Password'} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {isRtl ? 'افتراضي للتجربة: password123' : 'Demo default: password123'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full ps-10 pe-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                    />
                    <span>{isRtl ? 'تذكر بيانات تسجيل الدخول' : 'Remember my session'}</span>
                  </label>
                  <span className="text-cyan-700 font-semibold cursor-pointer hover:underline">
                    {isRtl ? 'سنتر 60 - بوابة الدخول الآمن' : '60 Center Secure Gateway'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl font-bold text-sm shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? (isRtl ? 'جارٍ التحقق...' : 'Signing in...') : (isRtl ? 'تسجيل الدخول إلى النظام' : 'Sign In to 60 Center')}</span>
                </button>
              </form>

              {/* Quick Demo Credentials Panel */}
              <div className="mt-8 pt-6 border-t border-slate-200 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                    {isRtl ? 'حسابات تجريبية سريعة بنقرة واحدة:' : 'Quick Demo Logins (Click to populate):'}
                  </span>
                  <span className="text-[11px] text-slate-400">Password: password123</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin@60center.com', 'password123')}
                    className="p-2.5 text-start bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">
                        {isRtl ? 'مسؤول النظام (Admin)' : 'Admin (Full)'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">Admin</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">admin@60center.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('reception@60center.com', 'password123')}
                    className="p-2.5 text-start bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">
                        {isRtl ? 'الاستقبال (Reception)' : 'Reception Desk'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Desk</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">reception@60center.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('accounts@60center.com', 'password123')}
                    className="p-2.5 text-start bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">
                        {isRtl ? 'الحسابات (Accountant)' : 'Accountant'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Finance</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">accounts@60center.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ceo@60center.com', 'password123')}
                    className="p-2.5 text-start bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">
                        {isRtl ? 'المدير التنفيذي (CEO)' : 'Executive CEO'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Director</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">ceo@60center.com</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ======================= REGISTER FORM ======================= */
            <div>
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isRtl ? 'الاسم الأول' : 'First Name'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={isRtl ? 'أحمد' : 'Ahmed'}
                        className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isRtl ? 'اسم العائلة / الأخير' : 'Last Name'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={isRtl ? 'محمود' : 'Mahmoud'}
                        className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isRtl ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="employee@60center.com"
                        className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isRtl ? 'رقم الهاتف' : 'Phone Number'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01012345678"
                        className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isRtl ? 'الدور الوظيفي / الصلاحيات' : 'Employee Role & Access Level'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { role: 'RECEPTION' as UserRole, labelEn: 'Reception Desk', labelAr: 'استقبال' },
                      { role: 'ACCOUNTANT' as UserRole, labelEn: 'Accountant', labelAr: 'محاسب' },
                      { role: 'ADMIN' as UserRole, labelEn: 'Center Admin', labelAr: 'إدارة السنتر' },
                      { role: 'TEACHER' as UserRole, labelEn: 'Teacher / Staff', labelAr: 'مدرس / طاقم' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSelectedRole(item.role)}
                        className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                          selectedRole === item.role
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-900 ring-2 ring-cyan-500/20 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{isRtl ? item.labelAr : item.labelEn}</div>
                        <div className="text-[10px] text-slate-500">{item.role}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isRtl ? 'كلمة المرور' : 'Password'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full ps-10 pe-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full ps-10 pe-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          confirmPassword && confirmPassword !== registerPassword
                            ? 'border-rose-300 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-cyan-500 focus:border-cyan-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl font-bold text-sm shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? (isRtl ? 'جارٍ إنشاء الحساب...' : 'Creating account...') : (isRtl ? 'إنشاء حساب جديد وتسجيل الدخول' : 'Create Staff Account & Sign In')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
