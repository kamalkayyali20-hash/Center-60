import React, { useState } from 'react';
import {
  X,
  Users,
  UserCheck,
  Shield,
  KeyRound,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  LogIn,
  Save,
  Phone,
  Mail,
  Search,
  Check,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';

export const AccountsControlModal: React.FC = () => {
  const {
    isAccountsControlModalOpen,
    setIsAccountsControlModalOpen,
    currentUser,
    users,
    switchActiveAccount,
    saveUser,
    deleteUser,
    deactivateUser,
    openAuthModal,
    isRtl,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'myProfile' | 'addAccount'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Edit Account state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('RECEPTION');
  const [editPassword, setEditPassword] = useState('');

  // Add Account state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('RECEPTION');
  const [newPassword, setNewPassword] = useState('');

  // My Profile edit state
  const [myFullName, setMyFullName] = useState(currentUser?.fullName || '');
  const [myEmail, setMyEmail] = useState(currentUser?.email || '');
  const [myPhone, setMyPhone] = useState(currentUser?.phoneNumber || currentUser?.phone || '');
  const [myPassword, setMyPassword] = useState(currentUser?.password || '');

  // Delete Confirmation state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Status message feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  if (!isAccountsControlModalOpen) return null;

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditPhone(user.phoneNumber || user.phone || '');
    setEditRole(user.role);
    setEditPassword(user.password || '');
    setFeedback({ type: null, message: '' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editFullName.trim() || !editEmail.trim()) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'الاسم والبريد الإلكتروني حقول مطلوبة.' : 'Name and email are required.',
      });
      return;
    }

    const result = saveUser({
      id: editingUser.id,
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      phoneNumber: editPhone.trim(),
      phone: editPhone.trim(),
      role: editRole,
      password: editPassword || editingUser.password,
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setEditingUser(null);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleSaveMyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const result = saveUser({
      id: currentUser.id,
      fullName: myFullName.trim(),
      email: myEmail.trim(),
      phoneNumber: myPhone.trim(),
      phone: myPhone.trim(),
      password: myPassword || currentUser.password,
    });

    if (result.success) {
      setFeedback({
        type: 'success',
        message: isRtl ? 'تم تحديث بيانات ملفك الشخصي بنجاح!' : 'Your profile has been updated successfully!',
      });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      setFeedback({
        type: 'error',
        message: isRtl ? 'يرجى إدخال اسم الموظف والبريد الإلكتروني.' : 'Please enter full name and email.',
      });
      return;
    }

    const result = saveUser({
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      phoneNumber: newPhone.trim(),
      phone: newPhone.trim(),
      role: newRole,
      password: newPassword || 'password123',
    });

    if (result.success) {
      setFeedback({
        type: 'success',
        message: isRtl ? 'تم إنشاء حساب الموظف الجديد بنجاح!' : 'New employee account created successfully!',
      });
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setActiveTab('accounts');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const result = deleteUser(userToDelete.id);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setUserToDelete(null);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm));
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>{isRtl ? 'إدارة والتحكم بحسابات النظام' : 'Account Control & Logged-In Sessions'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'التحكم بالحسابات المسجلة، تبديل الحساب النشط، تعديل البيانات والصلاحيات'
                  : 'Manage logged-in staff accounts, switch sessions, edit credentials & roles.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAccountsControlModalOpen(false);
              setEditingUser(null);
              setUserToDelete(null);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Quick Banner */}
        <div className="bg-slate-100/80 px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('accounts');
                setEditingUser(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isRtl ? 'جميع الحسابات' : 'All Accounts'}</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 text-slate-800 font-mono">
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('myProfile');
                setEditingUser(null);
                if (currentUser) {
                  setMyFullName(currentUser.fullName);
                  setMyEmail(currentUser.email);
                  setMyPhone(currentUser.phoneNumber || currentUser.phone || '');
                  setMyPassword(currentUser.password || '');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'myProfile'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حسابي النشط' : 'My Active Session'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('addAccount');
                setEditingUser(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'addAccount'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إضافة موظف' : 'Add Employee'}</span>
            </button>
          </div>

          {/* Current Active User Preview Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">{isRtl ? 'المستخدم النشط:' : 'Active:'}</span>
              <span className="font-bold">{currentUser.fullName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 font-mono font-bold text-emerald-800">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>

        {/* Global Feedback Banner */}
        {feedback.message && (
          <div
            className={`mx-5 sm:mx-6 mt-4 p-3 rounded-xl text-xs flex items-center justify-between gap-2 shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: null, message: '' })}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ALL ACCOUNTS & CONTROLS */}
          {activeTab === 'accounts' && !editingUser && (
            <div className="space-y-4">
              {/* Search & Role Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isRtl ? 'البحث بالاسم، البريد أو الهاتف...' : 'Search by name, email, or phone...'}
                    className={`w-full py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="ALL">{isRtl ? 'جميع الأدوار (All Roles)' : 'All System Roles'}</option>
                    <option value="ADMIN">Admin (مدير النظام)</option>
                    <option value="CEO">CEO / Director (إدارة عليا)</option>
                    <option value="RECEPTION">Reception (استقبال)</option>
                    <option value="ACCOUNTANT">Accountant (حسابات)</option>
                    <option value="TEACHER">Teacher (معلم)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setActiveTab('addAccount')}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إضافة حساب' : 'New Account'}</span>
                  </button>
                </div>
              </div>

              {/* Accounts Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUsers.map((user) => {
                  const isCurrentActive = currentUser?.id === user.id;
                  const roleBadgeColor =
                    user.role === 'ADMIN'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : user.role === 'CEO'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : user.role === 'ACCOUNTANT'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : user.role === 'TEACHER'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrentActive
                          ? 'bg-cyan-50/50 border-cyan-300 ring-2 ring-cyan-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-cyan-300 font-black flex items-center justify-center text-sm shrink-0 border border-slate-700">
                            {(user.fullName.substring(0, 2)).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {user.fullName}
                              </h4>
                              {isCurrentActive && (
                                <span className="px-2 py-0.5 bg-cyan-600 text-white rounded-full text-[9px] font-bold">
                                  {isRtl ? 'النشط الآن' : 'Active Now'}
                                </span>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-bold border mt-1 ${roleBadgeColor}`}>
                              <Shield className="w-2.5 h-2.5 me-1" />
                              {user.role}
                            </span>
                          </div>
                        </div>

                        {/* Status Active/Disabled Pill */}
                        <button
                          type="button"
                          onClick={() => deactivateUser(user.id)}
                          disabled={isCurrentActive}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            user.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          } ${isCurrentActive ? 'opacity-70 cursor-not-allowed' : ''}`}
                          title={isCurrentActive ? 'Cannot deactivate active account' : 'Toggle status'}
                        >
                          {user.isActive !== false ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Disabled')}
                        </button>
                      </div>

                      {/* Contact & Credentials Details */}
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono truncate">{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono">{user.phoneNumber}</span>
                          </div>
                        )}
                        {user.lastLogin && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isRtl ? 'آخر دخول:' : 'Last login:'} {user.lastLogin}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isCurrentActive ? (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'جلسة العمل الحالية' : 'Current Active Session'}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => switchActiveAccount(user.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>{isRtl ? 'تبديل إلى هذا الحساب' : 'Switch to Account'}</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(user)}
                            className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                            title={isRtl ? 'تعديل البيانات' : 'Edit Account'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            disabled={isCurrentActive || users.length <= 1}
                            className={`p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ${
                              isCurrentActive || users.length <= 1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''
                            }`}
                            title={isRtl ? 'حذف الحساب' : 'Delete Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EDIT SINGLE ACCOUNT FORM */}
          {activeTab === 'accounts' && editingUser && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {isRtl ? 'تعديل بيانات الحساب' : 'Edit Account'}: {editingUser.fullName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  {isRtl ? 'إلغاء والعودة' : 'Back to list'}
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الدور / الصلاحية' : 'System Role'} *
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="ADMIN">System Administrator (مدير النظام)</option>
                      <option value="CEO">CEO / Director (إدارة عليا)</option>
                      <option value="RECEPTION">Reception Desk (استقبال)</option>
                      <option value="ACCOUNTANT">Accountant (حسابات)</option>
                      <option value="TEACHER">Teacher (معلم)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'كلمة المرور' : 'Password'}
                    </label>
                    <input
                      type="text"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'حفظ التعديلات' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MY ACTIVE PROFILE EDIT */}
          {activeTab === 'myProfile' && currentUser && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center text-base">
                  {(currentUser.fullName.substring(0, 2)).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {currentUser.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono">{currentUser.email}</span>
                    <span>•</span>
                    <span className="font-bold text-cyan-700">{currentUser.role}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveMyProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الاسم المعروض' : 'Display Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={myFullName}
                      onChange={(e) => setMyFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={myEmail}
                      onChange={(e) => setMyEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={myPhone}
                      onChange={(e) => setMyPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'تغيير كلمة المرور' : 'Change Password'}
                    </label>
                    <input
                      type="text"
                      value={myPassword}
                      onChange={(e) => setMyPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'حفظ تعديلات حسابي' : 'Update Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ADD NEW EMPLOYEE ACCOUNT */}
          {activeTab === 'addAccount' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-cyan-600" />
                  <span>{isRtl ? 'إنشاء حساب موظف جديد' : 'Register New Staff Account'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl ? 'أدخل بيانات الموظف والصلاحيات لتفعيل الدخول للنظام' : 'Provide credentials and role permissions for new team member.'}
                </p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmed Ali"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@60center.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      placeholder="01012345678"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الدور / الصلاحية' : 'System Role'} *
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="RECEPTION">Reception Desk (استقبال)</option>
                      <option value="ACCOUNTANT">Accountant (حسابات)</option>
                      <option value="TEACHER">Teacher (معلم)</option>
                      <option value="ADMIN">System Administrator (مدير النظام)</option>
                      <option value="CEO">CEO / Director (إدارة عليا)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'كلمة المرور' : 'Password'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('accounts')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إنشاء الحساب وتفعيله' : 'Create Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-600" />
            <span>{isRtl ? 'جميع الحسابات محمية بنظام الأدوار والصلاحيات (RBAC)' : 'All accounts protected with Center RBAC'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAccountsControlModalOpen(false);
              openAuthModal('login');
            }}
            className="text-cyan-700 hover:text-cyan-800 font-bold hover:underline cursor-pointer"
          >
            {isRtl ? 'فتح نافذة تسجيل الدخول' : 'Sign in as another user'}
          </button>
        </div>
      </div>

      {/* CONFIRM DELETE DIALOG */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-base text-slate-900">
                {isRtl ? 'تأكيد حذف حساب الموظف' : 'Confirm Account Deletion'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? `هل أنت متأكد من رغبتك في حذف حساب "${userToDelete.fullName}" (${userToDelete.email})؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to permanently delete the account for "${userToDelete.fullName}" (${userToDelete.email})?`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نعم، احذف الحساب' : 'Yes, Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
