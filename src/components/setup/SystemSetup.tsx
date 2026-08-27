import React, { useState } from 'react';
import {
  Settings,
  BookOpen,
  GraduationCap,
  Layers,
  DoorClosed,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  History,
  ShieldAlert,
  Users,
  UserCheck,
  UserPlus,
  Trash2,
  Lock,
  Mail,
  Phone,
  Shield,
  KeyRound,
  LogIn,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { User, UserRole } from '../../types';

export const SystemSetup: React.FC = () => {
  const {
    t,
    isRtl,
    subjects,
    grades,
    educationSystems,
    rooms,
    users,
    saveSubject,
    saveGrade,
    saveRoom,
    updateEducationSystemRate,
    hasPermission,
    saveUser,
    deleteUser,
    deactivateUser,
    currentUser,
    openAuthModal,
    openAccountsControlModal,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'systems' | 'subjects' | 'grades' | 'rooms' | 'employees'>('systems');

  // Rate Adjustment Modal State
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState<number>(3); // IG
  const [newRateValue, setNewRateValue] = useState<number>(100);
  const [rateNotes, setRateNotes] = useState('');
  const [rateFeedback, setRateFeedback] = useState<string | null>(null);

  // Quick Add forms
  const [subjectEn, setSubjectEn] = useState('');
  const [subjectAr, setSubjectAr] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const [gradeEn, setGradeEn] = useState('');
  const [gradeAr, setGradeAr] = useState('');
  const [gradeCode, setGradeCode] = useState('');

  const [roomEn, setRoomEn] = useState('');
  const [roomAr, setRoomAr] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(40);
  const [roomFloor, setRoomFloor] = useState('1st Floor');

  // Employee modal state
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [empFullName, setEmpFullName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('RECEPTION');
  const [empFeedback, setEmpFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleOpenRateModal = (sysId: number, currentShare: number) => {
    setSelectedSystemId(sysId);
    setNewRateValue(currentShare);
    setRateNotes('');
    setRateFeedback(null);
    setRateModalOpen(true);
  };

  const handleApplyRateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateEducationSystemRate(selectedSystemId, newRateValue, rateNotes);
    if (res.success) {
      setRateFeedback(res.message);
      setTimeout(() => {
        setRateModalOpen(false);
      }, 1200);
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectEn || !subjectAr) return;
    saveSubject({ nameEn: subjectEn, nameAr: subjectAr, code: subjectCode || subjectEn.substring(0, 3).toUpperCase() });
    setSubjectEn('');
    setSubjectAr('');
    setSubjectCode('');
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeEn || !gradeAr) return;
    saveGrade({ nameEn: gradeEn, nameAr: gradeAr, code: gradeCode || `G${grades.length + 1}` });
    setGradeEn('');
    setGradeAr('');
    setGradeCode('');
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomEn || !roomAr) return;
    saveRoom({ nameEn: roomEn, nameAr: roomAr, capacity: roomCapacity, floor: roomFloor });
    setRoomEn('');
    setRoomAr('');
  };

  const handleOpenEmployeeModal = (u?: User) => {
    setEmpFeedback(null);
    if (u) {
      setEditingUserId(u.id);
      setEmpFullName(u.fullName);
      setEmpEmail(u.email);
      setEmpPhone(u.phoneNumber || u.phone || '');
      setEmpPassword(u.password || '');
      setEmpRole(u.role);
    } else {
      setEditingUserId(null);
      setEmpFullName('');
      setEmpEmail('');
      setEmpPhone('');
      setEmpPassword('password123');
      setEmpRole('RECEPTION');
    }
    setEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFullName.trim() || !empEmail.trim()) {
      setEmpFeedback({
        type: 'error',
        message: isRtl ? 'يرجى إدخال الاسم والبريد الإلكتروني.' : 'Full name and email are required.',
      });
      return;
    }

    const payload: Partial<User> = {
      fullName: empFullName.trim(),
      fullNameAr: empFullName.trim(),
      email: empEmail.trim().toLowerCase(),
      phoneNumber: empPhone.trim(),
      phone: empPhone.trim(),
      password: empPassword || 'password123',
      role: empRole,
    };

    if (editingUserId) {
      payload.id = editingUserId;
    }

    const res = saveUser(payload);
    if (res.success) {
      setEmpFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setEmployeeModalOpen(false);
      }, 700);
    } else {
      setEmpFeedback({ type: 'error', message: res.message });
    }
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.setup.title}
        subtitle={t.setup.subtitle}
        icon={Settings}
        badge="Admin Only"
        breadcrumbs={[
          { label: '60 Center' },
          { label: t.nav.systemSetup },
        ]}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('systems')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'systems'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.setup.tabs.systems}</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'subjects'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.setup.tabs.subjects}</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'grades'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t.setup.tabs.grades}</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'rooms'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DoorClosed className="w-4 h-4" />
          <span>{t.setup.tabs.rooms}</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isRtl ? 'حسابات الموظفين والدخول' : 'Staff Accounts & Access'}</span>
        </button>
      </div>

      {/* 1. EDUCATION SYSTEMS & EFFECTIVE-DATED RATES TAB */}
      {activeTab === 'systems' && (
        <div className="space-y-6">
          <SectionCard
            title="Education Systems & Center Retention Rules"
            subtitle="Configurable center share per lesson. Adjustments are protected via effective date versioning."
            icon={<Layers className="w-5 h-5 text-cyan-600" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {educationSystems.map((sys) => (
                <div
                  key={sys.id}
                  className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-900 text-cyan-300 font-mono">
                        {sys.code}
                      </span>
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">{sys.nameEn}</h4>
                    <p className="text-xs text-slate-400 font-arabic">{sys.nameAr}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t.setup.currentShare}:</span>
                      <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                        {sys.currentCenterShare.toFixed(2)} {t.common.egp}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={!hasPermission('FINANCIAL_CONFIG_EDIT')}
                      onClick={() => handleOpenRateModal(sys.id, sys.currentCenterShare)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {t.setup.adjustShare}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* EFFECTIVE-DATED RATE HISTORY AUDIT LOG */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-sm text-slate-900">{t.setup.rateHistoryTitle}</h4>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-900 text-slate-200 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 text-start">System</th>
                      <th className="px-4 py-2.5 text-end">Center Share (EGP)</th>
                      <th className="px-4 py-2.5 text-start">{t.setup.effectiveFrom}</th>
                      <th className="px-4 py-2.5 text-start">{t.setup.effectiveTo}</th>
                      <th className="px-4 py-2.5 text-start">Audit Notes</th>
                      <th className="px-4 py-2.5 text-start">Adjusted By</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {educationSystems.flatMap((sys) =>
                      sys.rateHistory.map((rate) => (
                        <tr key={rate.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{sys.nameEn} ({sys.code})</td>
                          <td className="px-4 py-2.5 text-end font-mono font-bold text-cyan-800">
                            {rate.centerShare.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">{rate.effectiveFrom}</td>
                          <td className="px-4 py-2.5 text-slate-500">
                            {rate.effectiveTo || <span className="text-emerald-700 font-semibold">Present (Active)</span>}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{rate.notes || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-500">{rate.createdBy}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rate.effectiveTo === null
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {rate.effectiveTo === null ? 'Current' : 'Archived'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* 2. SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SectionCard title={t.setup.addSubject} subtitle="Register new academic discipline">
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.nameEn}</label>
                  <input
                    type="text"
                    required
                    value={subjectEn}
                    onChange={(e) => setSubjectEn(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.nameAr}</label>
                  <input
                    type="text"
                    required
                    value={subjectAr}
                    onChange={(e) => setSubjectAr(e.target.value)}
                    placeholder="مثال: الفيزياء"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="PHY"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.setup.addSubject}</span>
                </button>
              </form>
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard title="Active Subjects Registry" badge={`${subjects.length} Subjects`}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-900 text-slate-200 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 text-start">Code</th>
                      <th className="px-4 py-2.5 text-start">{t.setup.nameEn}</th>
                      <th className="px-4 py-2.5 text-start">{t.setup.nameAr}</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-cyan-800">{sub.code}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{sub.nameEn}</td>
                        <td className="px-4 py-2.5 text-slate-700 font-arabic">{sub.nameAr}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* 3. GRADES TAB */}
      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SectionCard title={t.setup.addGrade} subtitle="Configure scholastic stages">
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.nameEn}</label>
                  <input
                    type="text"
                    required
                    value={gradeEn}
                    onChange={(e) => setGradeEn(e.target.value)}
                    placeholder="e.g. Grade 12"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.nameAr}</label>
                  <input
                    type="text"
                    required
                    value={gradeAr}
                    onChange={(e) => setGradeAr(e.target.value)}
                    placeholder="مثال: الصف الثاني عشر"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Code</label>
                  <input
                    type="text"
                    value={gradeCode}
                    onChange={(e) => setGradeCode(e.target.value)}
                    placeholder="G12"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.setup.addGrade}</span>
                </button>
              </form>
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard title="Configured Academic Grades" badge={`${grades.length} Grades`}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-900 text-slate-200 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 text-start">Code</th>
                      <th className="px-4 py-2.5 text-start">{t.setup.nameEn}</th>
                      <th className="px-4 py-2.5 text-start">{t.setup.nameAr}</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {grades.map((grd) => (
                      <tr key={grd.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-cyan-800">{grd.code}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{grd.nameEn}</td>
                        <td className="px-4 py-2.5 text-slate-700 font-arabic">{grd.nameAr}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* 4. ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SectionCard title={t.setup.addRoom} subtitle="Register classroom / auditorium">
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.nameEn}</label>
                  <input
                    type="text"
                    required
                    value={roomEn}
                    onChange={(e) => setRoomEn(e.target.value)}
                    placeholder="e.g. Room 101"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.nameAr}</label>
                  <input
                    type="text"
                    required
                    value={roomAr}
                    onChange={(e) => setRoomAr(e.target.value)}
                    placeholder="مثال: قاعة 101"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.capacity}</label>
                    <input
                      type="number"
                      value={roomCapacity}
                      onChange={(e) => setRoomCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.setup.floor}</label>
                    <input
                      type="text"
                      value={roomFloor}
                      onChange={(e) => setRoomFloor(e.target.value)}
                      placeholder="1st Floor"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.setup.addRoom}</span>
                </button>
              </form>
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard title="Lecture Halls & Classrooms" badge={`${rooms.length} Rooms`}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-900 text-slate-200 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 text-start">Room Name (English)</th>
                      <th className="px-4 py-2.5 text-start">Room Name (Arabic)</th>
                      <th className="px-4 py-2.5 text-end">Capacity</th>
                      <th className="px-4 py-2.5 text-start">Location</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rooms.map((rm) => (
                      <tr key={rm.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{rm.nameEn}</td>
                        <td className="px-4 py-2.5 text-slate-700 font-arabic">{rm.nameAr}</td>
                        <td className="px-4 py-2.5 text-end font-mono font-bold text-cyan-900">{rm.capacity} Seats</td>
                        <td className="px-4 py-2.5 text-slate-500">{rm.floor}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* 5. EMPLOYEES & STAFF ACCOUNTS TAB */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <SectionCard
            title={isRtl ? 'إدارة حسابات الموظفين والوصول إلى النظام' : 'Staff Accounts & Access Management'}
            subtitle={
              isRtl
                ? 'إدارة حسابات تسجيل الدخول، الصلاحيات، إنشاء حسابات جديدة أو حذف الحسابات غير المرغوبة'
                : 'Manage system login credentials, RBAC role permissions, employee registration, and account removal.'
            }
            icon={<Users className="w-5 h-5 text-cyan-600" />}
            headerAction={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAccountsControlModal()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Open Account Control Modal"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isRtl ? 'لوحة التحكم بالحسابات' : 'Accounts Control'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('authPage')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Open Dedicated Auth Screen"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isRtl ? 'بوابة تسجيل الدخول' : 'Access Auth Page'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEmployeeModal()}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة موظف جديد' : 'New Employee Account'}</span>
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-start">#</th>
                    <th className="px-4 py-3 font-bold text-start">{isRtl ? 'الموظف' : 'Staff Member'}</th>
                    <th className="px-4 py-3 font-bold text-start">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</th>
                    <th className="px-4 py-3 font-bold text-start">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</th>
                    <th className="px-4 py-3 font-bold text-start">{isRtl ? 'الصلاحية / الدور' : 'System Role'}</th>
                    <th className="px-4 py-3 font-bold text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 font-bold text-end">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u, idx) => {
                    const isSelf = currentUser?.id === u.id;
                    const roleBadgeColor =
                      u.role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : u.role === 'CEO'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : u.role === 'ACCOUNTANT'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : u.role === 'TEACHER'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-black flex items-center justify-center text-xs shrink-0 border border-cyan-200">
                              {(u.fullName.substring(0, 2)).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-sm bg-cyan-600 text-white">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {u.id} • @{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {u.phoneNumber || u.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phoneNumber || u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeColor}`}
                          >
                            <Shield className="w-3 h-3 me-1" />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => deactivateUser(u.id)}
                            disabled={isSelf}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              u.isActive !== false
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            } ${isSelf ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title={isSelf ? 'Cannot deactivate self' : 'Toggle Active Status'}
                          >
                            {u.isActive !== false ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Disabled')}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEmployeeModal(u)}
                              className="px-2 py-1 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              {isRtl ? 'تعديل' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              disabled={isSelf}
                              className={`p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer ${
                                isSelf ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''
                              }`}
                              title={isSelf ? 'Cannot delete logged in account' : (isRtl ? 'حذف الحساب' : 'Delete Account')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>
                  {isRtl
                    ? 'يتم تخزين بيانات الموظفين وكلمات المرور بشكل آمن ومحلي في نظام سنتر 60.'
                    : 'Employee accounts, passwords, and contact info are securely managed in the system.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRtl ? 'نافذة التسجيل السريع' : 'Quick Register Modal'}</span>
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {employeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">
                  {editingUserId
                    ? (isRtl ? 'تعديل بيانات الموظف' : 'Edit Employee Account')
                    : (isRtl ? 'إضافة موظف جديد' : 'Register New Employee')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmployeeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {empFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    empFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {empFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{empFeedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الاسم الكامل' : 'Full Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={empFullName}
                  onChange={(e) => setEmpFullName(e.target.value)}
                  placeholder="e.g. Sarah Hassan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="user@60center.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الدور / الصلاحية' : 'User Role'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="RECEPTION">Reception Desk (استقبال)</option>
                    <option value="ACCOUNTANT">Accountant (حسابات)</option>
                    <option value="TEACHER">Teacher (مدرس)</option>
                    <option value="ADMIN">System Administrator (مدير النظام)</option>
                    <option value="CEO">Executive / Director (إدارة عليا)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'كلمة المرور' : 'Password'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmployeeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingUserId ? (isRtl ? 'حفظ التعديلات' : 'Save Changes') : (isRtl ? 'إنشاء الحساب' : 'Create Account')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE EMPLOYEE MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">
                  {isRtl ? 'تأكيد حذف حساب الموظف' : 'Confirm Account Deletion'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="p-1 text-white/80 hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? `هل أنت متأكد من رغبتك في حذف حساب الموظف "${userToDelete.fullName}" (${userToDelete.email})؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to permanently remove the staff account for "${userToDelete.fullName}" (${userToDelete.email})? This action cannot be undone.`}
              </p>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {isRtl ? 'سيتم تسجيل عملية الحذف في سجل المراجعة (Audit Log).' : 'This action will be logged in the system audit trail.'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'حذف الحساب نهائياً' : 'Delete Account'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EFFECTIVE-DATED RATE ADJUSTMENT MODAL */}
      {rateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">{t.setup.adjustShare}</h3>
              </div>
            </div>

            <form onSubmit={handleApplyRateAdjustment} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">{t.setup.adjustShareDesc}</p>

              {rateFeedback && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rateFeedback}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Center Share (EGP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-base font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Adjustment & Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={rateNotes}
                  onChange={(e) => setRateNotes(e.target.value)}
                  placeholder="e.g. Approved price index increase for 2026/2027 academic year"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Commit Rate Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
