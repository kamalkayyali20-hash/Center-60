import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit,
  DollarSign,
  TrendingUp,
  Award,
  BookOpen,
  Filter,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { MetricCard } from '../common/MetricCard';
import { TimeFilterBar, TimeFilterPeriod } from '../common/TimeFilterBar';

export const TeachersDashboard: React.FC = () => {
  const {
    t,
    isRtl,
    teachers,
    classes,
    sessions,
    payments,
    saveTeacher,
    deactivateTeacher,
    hasPermission,
    setCurrentView,
  } = useApp();

  // Time filter state - defaults to 'today' (sysday)
  const [period, setPeriod] = useState<TimeFilterPeriod>('today');
  const [specificDate, setSpecificDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Search and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Teacher modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sysday string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter payments and sessions based on selected time period
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (period === 'all') return true;
      if (period === 'today') return s.sessionDate === todayStr;
      if (period === 'specific') return s.sessionDate === specificDate;
      if (period === 'week') {
        const d = new Date(s.sessionDate);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === 'month') {
        const d = new Date(s.sessionDate);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      return true;
    });
  }, [sessions, period, todayStr, specificDate]);

  const filteredPayments = useMemo(() => {
    const sessionIds = new Set(filteredSessions.map((s) => s.id));
    return payments.filter((p) => sessionIds.has(p.sessionId) && !p.isCancelled);
  }, [payments, filteredSessions]);

  // Compute metrics per teacher
  const teacherStatsMap = useMemo(() => {
    const map = new Map<
      number,
      {
        totalClasses: number;
        periodSessions: number;
        periodStudentsAttended: number;
        periodTeacherShare: number;
        periodGrossRevenue: number;
      }
    >();

    teachers.forEach((tch) => {
      const teacherClasses = classes.filter((c) => c.teacherId === tch.id);
      const teacherSessions = filteredSessions.filter((s) => s.teacherId === tch.id);
      const teacherPayments = filteredPayments.filter((p) => p.teacherId === tch.id);

      const periodTeacherShare = teacherPayments.reduce((sum, p) => sum + p.teacherShare, 0);
      const periodGrossRevenue = teacherPayments.reduce((sum, p) => sum + p.amountPaid, 0);

      map.set(tch.id, {
        totalClasses: teacherClasses.length,
        periodSessions: teacherSessions.length,
        periodStudentsAttended: teacherPayments.length,
        periodTeacherShare,
        periodGrossRevenue,
      });
    });

    return map;
  }, [teachers, classes, filteredSessions, filteredPayments]);

  // Overall KPI metrics
  const activeTeachersCount = teachers.filter((t) => t.isActive).length;
  const totalPeriodSessions = filteredSessions.length;
  const totalPeriodTeacherPayouts = filteredPayments.reduce((sum, p) => sum + p.teacherShare, 0);
  const totalPeriodStudents = filteredPayments.length;

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((tch) => {
      if (statusFilter === 'ACTIVE' && !tch.isActive) return false;
      if (statusFilter === 'INACTIVE' && tch.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = tch.name.toLowerCase().includes(q);
        const matchCode = tch.code.toLowerCase().includes(q);
        const matchPhone = tch.phone.includes(q);
        return matchName || matchCode || matchPhone;
      }
      return true;
    });
  }, [teachers, searchQuery, statusFilter]);

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setHireDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tch: Teacher) => {
    setEditingTeacher(tch);
    setName(tch.name);
    setPhone(tch.phone);
    setEmail(tch.email);
    setAddress(tch.address);
    setHireDate(tch.hireDate);
    setNotes(tch.notes);
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = saveTeacher({
      id: editingTeacher?.id,
      name,
      phone,
      email,
      address,
      hireDate,
      notes,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setModalOpen(false);
      }, 700);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={isRtl ? 'لوحة تحكم وإدارة المعلمين' : 'Teachers Dashboard & Management'}
        subtitle={
          isRtl
            ? 'لوحة متكاملة لمتابعة أداء المدرسين، الجلسات، الحصص المالية، والملفات التعريفية'
            : 'Comprehensive dashboard for instructor performance, session schedules, and financial share analytics'
        }
        icon={GraduationCap}
        badge={isRtl ? 'شاشة مستقلة' : 'Dedicated View'}
        breadcrumbs={[
          { label: '60 Center' },
          { label: isRtl ? 'المعلمون' : 'Teachers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة مدرس جديد' : 'New Teacher'}</span>
            </button>
          </div>
        }
      />

      {/* Reusable Time Filter Bar */}
      <TimeFilterBar
        period={period}
        onPeriodChange={setPeriod}
        specificDate={specificDate}
        onSpecificDateChange={setSpecificDate}
        quickStatsSummary={`${filteredTeachers.length} ${isRtl ? 'مدرس' : 'Teachers'}`}
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={isRtl ? 'المدرسون النشطون' : 'Active Teachers'}
          value={activeTeachersCount}
          subtitle={`${teachers.length} ${isRtl ? 'إجمالي المسجلين' : 'Total in Registry'}`}
          icon={<GraduationCap className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title={isRtl ? 'جلسات الفترة المحددة' : 'Period Active Sessions'}
          value={totalPeriodSessions}
          subtitle={period === 'today' ? (isRtl ? 'جلسات اليوم (Sysday)' : 'Today (Sysday)') : `${period} filter`}
          icon={<Clock className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title={isRtl ? 'حضور الطلاب بالفترة' : 'Period Student Attendance'}
          value={totalPeriodStudents}
          subtitle={isRtl ? 'إجمالي الحضور والمدفوعات' : 'Total attendees & receipts'}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title={isRtl ? 'مستحقات المعلمين بالفترة' : 'Period Teacher Earnings'}
          value={`${totalPeriodTeacherPayouts.toLocaleString()} EGP`}
          subtitle={isRtl ? 'حصة المدرسين المستحقة' : 'Earned teacher share'}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* TEACHERS DASHBOARD LIST */}
      <SectionCard
        title={isRtl ? 'دليل المعلمين ومؤشرات الأداء' : 'Teachers Directory & Performance Summary'}
        subtitle={
          isRtl
            ? 'عرض تفصيلي لبيانات المدرس، عدد المجموعات، الحصص النشطة، والإيرادات المحققة'
            : 'Detailed performance metrics, contact info, class counts, and period financial splits'
        }
        badge={`${filteredTeachers.length} ${isRtl ? 'مدرس' : 'Teachers'}`}
        icon={<GraduationCap className="w-5 h-5 text-slate-700" />}
        headerAction={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث باسم المدرس، الكود، الهاتف...' : 'Search teacher, code, phone...'}
                className="ps-8 pe-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 w-48 sm:w-60"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{isRtl ? 'كافة الحالات' : 'All Status'}</option>
              <option value="ACTIVE">{isRtl ? 'نشط فقط' : 'Active Only'}</option>
              <option value="INACTIVE">{isRtl ? 'غير نشط' : 'Inactive Only'}</option>
            </select>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((tch) => {
            const stats = teacherStatsMap.get(tch.id) || {
              totalClasses: 0,
              periodSessions: 0,
              periodStudentsAttended: 0,
              periodTeacherShare: 0,
              periodGrossRevenue: 0,
            };

            return (
              <div
                key={tch.id}
                className={`p-4 rounded-xl border transition-all ${
                  tch.isActive
                    ? 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-cyan-400 font-bold flex items-center justify-center text-sm shadow-xs">
                      {tch.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{tch.name}</h4>
                      <span className="font-mono text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                        {tch.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tch.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tch.isActive ? (isRtl ? 'نشط' : 'Active') : isRtl ? 'غير نشط' : 'Inactive'}
                  </span>
                </div>

                {/* Contact details */}
                <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{tch.phone || '-'}</span>
                  </div>
                  {tch.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{tch.email}</span>
                    </div>
                  )}
                  {tch.address && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{tch.address}</span>
                    </div>
                  )}
                </div>

                {/* Performance in Selected Period */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">
                      {isRtl ? 'الفصول / المجموعات' : 'Assigned Classes'}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">{stats.totalClasses}</div>
                  </div>
                  <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100">
                    <div className="text-[10px] text-indigo-700 font-semibold uppercase">
                      {isRtl ? 'جلسات الفترة' : 'Period Sessions'}
                    </div>
                    <div className="text-sm font-extrabold text-indigo-950">{stats.periodSessions}</div>
                  </div>
                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase">
                      {isRtl ? 'الطلاب الحاضرون' : 'Students Attended'}
                    </div>
                    <div className="text-sm font-extrabold text-emerald-950">{stats.periodStudentsAttended}</div>
                  </div>
                  <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                    <div className="text-[10px] text-amber-700 font-semibold uppercase">
                      {isRtl ? 'مستحقات الفترة' : 'Period Earnings'}
                    </div>
                    <div className="text-xs font-bold font-mono text-amber-900">
                      {stats.periodTeacherShare.toLocaleString()} EGP
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tch)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تعديل البيانات' : 'Edit Profile'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deactivateTeacher(tch.id)}
                    title={tch.isActive ? 'Deactivate' : 'Activate'}
                    className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {tch.isActive ? <UserX className="w-4 h-4 text-rose-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* TEACHER ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingTeacher
                      ? isRtl
                        ? `تعديل بيانات: ${editingTeacher.name}`
                        : `Edit Teacher: ${editingTeacher.name}`
                      : isRtl
                      ? 'إضافة مدرس جديد'
                      : 'Register New Teacher'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'بيانات المدرس وسجل الاتصال والتعيين' : 'Instructor credentials and contact details'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اسم المدرس بالكامل *' : 'Teacher Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Karim Mostafa"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@60center.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'العنوان / المنطقة' : 'Address / District'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Nasr City, Cairo"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'تاريخ التعيين' : 'Hire Date'}
                  </label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'ملاحظات وتخصص' : 'Specialization & Notes'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Senior Physics Specialist (IG & American)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isRtl ? 'حفظ البيانات' : 'Save Teacher Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
