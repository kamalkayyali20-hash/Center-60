import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Layers,
  GraduationCap,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Sliders,
  Sparkles,
  Award,
  Clock,
  UserX,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassEntity } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { MetricCard } from '../common/MetricCard';
import { TimeFilterBar, TimeFilterPeriod } from '../common/TimeFilterBar';

export const ClassesDashboard: React.FC = () => {
  const {
    t,
    isRtl,
    classes,
    teachers,
    subjects,
    grades,
    educationSystems,
    enrollments,
    sessions,
    payments,
    saveClass,
    deactivateClass,
    hasPermission,
    setCurrentView,
    navigateToSessionDetail,
  } = useApp();

  // Time filter state - defaults to 'today' (sysday)
  const [period, setPeriod] = useState<TimeFilterPeriod>('today');
  const [specificDate, setSpecificDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Search and drop-down filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<number | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<number | 'ALL'>('ALL');
  const [filterSystem, setFilterSystem] = useState<number | 'ALL'>('ALL');
  const [filterTeacher, setFilterTeacher] = useState<number | 'ALL'>('ALL');

  // Modal State for Class Form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState<number>(teachers[0]?.id || 1);
  const [subjectId, setSubjectId] = useState<number>(subjects[0]?.id || 1);
  const [gradeId, setGradeId] = useState<number>(grades[0]?.id || 1);
  const [systemId, setSystemId] = useState<number>(educationSystems[0]?.id || 1);
  const [lessonPrice, setLessonPrice] = useState<number>(250);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sysday string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // System Center Share lookup
  const currentSystem = useMemo(() => {
    return educationSystems.find((sys) => sys.id === systemId) || educationSystems[0];
  }, [educationSystems, systemId]);

  const centerShare = currentSystem ? currentSystem.currentCenterShare : 0;
  const teacherShare = Math.max(0, lessonPrice - centerShare);
  const isPriceValid = lessonPrice >= centerShare;

  // Filter sessions and payments by selected period
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

  // Aggregate metrics per class
  const classStatsMap = useMemo(() => {
    const map = new Map<
      number,
      {
        enrolledStudents: number;
        periodSessions: number;
        periodAttendees: number;
        periodGrossRevenue: number;
        periodCenterShare: number;
        periodTeacherShare: number;
      }
    >();

    classes.forEach((cls) => {
      const activeEnrolls = enrollments.filter((e) => e.classId === cls.id && e.isActive);
      const classSessions = filteredSessions.filter((s) => s.classId === cls.id);
      const classPayments = filteredPayments.filter((p) => p.classId === cls.id);

      const periodGrossRevenue = classPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const periodCenterShare = classPayments.reduce((sum, p) => sum + p.centerShare, 0);
      const periodTeacherShare = classPayments.reduce((sum, p) => sum + p.teacherShare, 0);

      map.set(cls.id, {
        enrolledStudents: activeEnrolls.length,
        periodSessions: classSessions.length,
        periodAttendees: classPayments.length,
        periodGrossRevenue,
        periodCenterShare,
        periodTeacherShare,
      });
    });

    return map;
  }, [classes, enrollments, filteredSessions, filteredPayments]);

  // KPI calculations
  const totalActiveClasses = classes.filter((c) => c.isActive).length;
  const totalEnrolled = enrollments.filter((e) => e.isActive).length;
  const periodTotalRevenue = filteredPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const periodTotalCenterProfit = filteredPayments.reduce((sum, p) => sum + p.centerShare, 0);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      if (filterSubject !== 'ALL' && cls.subjectId !== filterSubject) return false;
      if (filterGrade !== 'ALL' && cls.gradeId !== filterGrade) return false;
      if (filterSystem !== 'ALL' && cls.systemId !== filterSystem) return false;
      if (filterTeacher !== 'ALL' && cls.teacherId !== filterTeacher) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = cls.name.toLowerCase().includes(q);
        const matchTeacher = (cls.teacherName || '').toLowerCase().includes(q);
        const matchSubject = (cls.subjectName || '').toLowerCase().includes(q);
        const matchGrade = (cls.gradeName || '').toLowerCase().includes(q);
        return matchName || matchTeacher || matchSubject || matchGrade;
      }
      return true;
    });
  }, [classes, filterSubject, filterGrade, filterSystem, filterTeacher, searchQuery]);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setName('');
    setTeacherId(teachers[0]?.id || 1);
    setSubjectId(subjects[0]?.id || 1);
    setGradeId(grades[0]?.id || 1);
    setSystemId(educationSystems[0]?.id || 1);
    setLessonPrice(250);
    setIsActive(true);
    setNotes('');
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassEntity) => {
    setEditingClass(cls);
    setName(cls.name);
    setTeacherId(cls.teacherId);
    setSubjectId(cls.subjectId);
    setGradeId(cls.gradeId);
    setSystemId(cls.systemId);
    setLessonPrice(cls.lessonPrice);
    setIsActive(cls.isActive);
    setNotes(cls.notes || '');
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isPriceValid) {
      setFeedback({
        type: 'error',
        message: `Lesson price (${lessonPrice} EGP) cannot be less than center share (${centerShare} EGP).`,
      });
      return;
    }

    const res = saveClass({
      id: editingClass?.id,
      name,
      teacherId,
      subjectId,
      gradeId,
      systemId,
      lessonPrice,
      isActive,
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
        title={isRtl ? 'لوحة تحكم وإدارة الفصول والمجموعات' : 'Classes & Courses Dashboard'}
        subtitle={
          isRtl
            ? 'لوحة منفصلة لإدارة الفصول والمناهج الدراسية، تسعير الحصص، والمناصفات المالية بين المركز والمدرس'
            : 'Standalone dashboard for academic groups, revenue sharing splits, curriculum systems, and student rosters'
        }
        icon={BookOpen}
        badge={isRtl ? 'شاشة مستقلة' : 'Dedicated View'}
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: isRtl ? 'الفصول والمجموعات' : 'Classes & Courses' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إنشاء فصل جديد' : 'New Class'}</span>
            </button>
          </div>
        }
      />

      {/* Time Filter Bar */}
      <TimeFilterBar
        period={period}
        onPeriodChange={setPeriod}
        specificDate={specificDate}
        onSpecificDateChange={setSpecificDate}
        quickStatsSummary={`${filteredClasses.length} ${isRtl ? 'مجموعة' : 'Classes'}`}
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={isRtl ? 'الفصول النشطة' : 'Active Classes'}
          value={totalActiveClasses}
          subtitle={`${classes.length} ${isRtl ? 'إجمالي المجموعات المسجلة' : 'Total registered'}`}
          icon={<BookOpen className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title={isRtl ? 'الطلاب المقيدون' : 'Active Enrollments'}
          value={totalEnrolled}
          subtitle={isRtl ? 'اشتراكات سارية بالفصول' : 'Total active students'}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title={isRtl ? 'إيرادات الفترة الإجمالية' : 'Period Gross Revenue'}
          value={`${periodTotalRevenue.toLocaleString()} EGP`}
          subtitle={period === 'today' ? (isRtl ? 'تحصيلات اليوم (Sysday)' : 'Today (Sysday)') : `${period} intake`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title={isRtl ? 'صافي أرباح المركز بالفترة' : 'Center Share (Period)'}
          value={`${periodTotalCenterProfit.toLocaleString()} EGP`}
          subtitle={isRtl ? 'حصة السنتر المحققة' : 'Center retained revenue'}
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* CLASSES DASHBOARD GRID */}
      <SectionCard
        title={isRtl ? 'دليل الفصول والمجموعات الدراسية' : 'Classes Directory & Revenue Breakdown'}
        subtitle={
          isRtl
            ? 'متابعة سعر الحصة، اقتسام الإيراد، أعداد المشتركين، وجلسات الفترة المحددة'
            : 'Detailed pricing configuration, center/teacher revenue splits, and active enrollment totals'
        }
        badge={`${filteredClasses.length} ${isRtl ? 'مجموعة' : 'Classes'}`}
        icon={<Layers className="w-5 h-5 text-slate-700" />}
        headerAction={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث باسم الفصل، المدرس، المادة...' : 'Search class, teacher, subject...'}
                className="ps-8 pe-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{isRtl ? 'كافة الأنظمة' : 'All Systems'}</option>
              {educationSystems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {isRtl ? sys.nameAr : sys.nameEn}
                </option>
              ))}
            </select>

            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{isRtl ? 'كافة المعلمين' : 'All Teachers'}</option>
              {teachers.map((tch) => (
                <option key={tch.id} value={tch.id}>
                  {tch.name}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const stats = classStatsMap.get(cls.id) || {
              enrolledStudents: 0,
              periodSessions: 0,
              periodAttendees: 0,
              periodGrossRevenue: 0,
              periodCenterShare: 0,
              periodTeacherShare: 0,
            };

            return (
              <div
                key={cls.id}
                className={`p-4 rounded-xl border transition-all ${
                  cls.isActive
                    ? 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{cls.name}</h4>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{cls.teacherName}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cls.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cls.isActive ? (isRtl ? 'نشط' : 'Active') : isRtl ? 'غير نشط' : 'Inactive'}
                  </span>
                </div>

                {/* System & Grade Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {cls.subjectName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {cls.gradeName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {cls.systemName}
                  </span>
                </div>

                {/* Financial Split Box */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{isRtl ? 'سعر الحصة للطالب:' : 'Lesson Price:'}</span>
                    <span className="font-mono font-bold text-slate-900">{cls.lessonPrice} EGP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-emerald-700 font-medium">{isRtl ? 'حصة المركز:' : 'Center Share:'}</span>
                    <span className="font-mono font-bold text-emerald-800">+{cls.centerShare} EGP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-700 font-medium">{isRtl ? 'حصة المدرس:' : 'Teacher Share:'}</span>
                    <span className="font-mono font-bold text-cyan-800">+{cls.teacherShare} EGP</span>
                  </div>
                </div>

                {/* Period Performance */}
                <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
                  <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[9px] text-slate-500 font-semibold uppercase">
                      {isRtl ? 'المقيدون' : 'Enrolled'}
                    </div>
                    <div className="text-xs font-bold text-slate-900">{stats.enrolledStudents}</div>
                  </div>
                  <div className="p-1.5 bg-indigo-50/60 rounded-lg border border-indigo-100">
                    <div className="text-[9px] text-indigo-700 font-semibold uppercase">
                      {isRtl ? 'جلسات الفترة' : 'Sessions'}
                    </div>
                    <div className="text-xs font-bold text-indigo-950">{stats.periodSessions}</div>
                  </div>
                  <div className="p-1.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                    <div className="text-[9px] text-emerald-700 font-semibold uppercase">
                      {isRtl ? 'إيراد الفترة' : 'Revenue'}
                    </div>
                    <div className="text-[11px] font-bold font-mono text-emerald-950">
                      {stats.periodGrossRevenue.toLocaleString()} EGP
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cls)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تعديل الفصل' : 'Edit Class'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deactivateClass(cls.id)}
                    title={cls.isActive ? 'Deactivate' : 'Activate'}
                    className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {cls.isActive ? <UserX className="w-4 h-4 text-rose-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* CLASS ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingClass
                      ? isRtl
                        ? `تعديل فصل: ${editingClass.name}`
                        : `Edit Class: ${editingClass.name}`
                      : isRtl
                      ? 'إنشاء فصل / مجموعة جديدة'
                      : 'Create New Class / Group'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'تحديد المدرس، المنهج، وسعر الحصة مع احتساب الحصص تلقائياً' : 'Curriculum, instructor assignment & auto revenue calculation'}
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
                  {isRtl ? 'اسم الفصل / المجموعة *' : 'Class / Group Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Physics - Grade 12 (IGCSE Section A)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'المدرس المسؤول *' : 'Assigned Teacher *'}
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {teachers.map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.name} ({tch.code}) {tch.isActive ? '' : ' - Inactive'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المادة' : 'Subject'}
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {isRtl ? sub.nameAr : sub.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الصف الدراسي' : 'Grade'}
                  </label>
                  <select
                    value={gradeId}
                    onChange={(e) => setGradeId(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {grades.map((grd) => (
                      <option key={grd.id} value={grd.id}>
                        {isRtl ? grd.nameAr : grd.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'النظام التعليمي' : 'Education System'}
                  </label>
                  <select
                    value={systemId}
                    onChange={(e) => setSystemId(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {educationSystems.map((sys) => (
                      <option key={sys.id} value={sys.id}>
                        {isRtl ? sys.nameAr : sys.nameEn} ({sys.currentCenterShare} EGP)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Realtime Calculated Split */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRtl ? 'سعر الحصة للطالب (EGP) *' : 'Lesson Price per Student (EGP) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lessonPrice}
                    onChange={(e) => setLessonPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 font-bold">
                      {isRtl ? 'حصة المركز (محسوبة)' : 'Center Share (Auto)'}
                    </div>
                    <div className="text-sm font-extrabold text-emerald-950 font-mono">
                      {centerShare} EGP
                    </div>
                  </div>

                  <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="text-[10px] text-cyan-800 font-bold">
                      {isRtl ? 'حصة المدرس (المتبقي)' : 'Teacher Share (Auto)'}
                    </div>
                    <div className="text-sm font-extrabold text-cyan-950 font-mono">
                      {teacherShare} EGP
                    </div>
                  </div>
                </div>

                {!isPriceValid && (
                  <p className="text-[11px] font-semibold text-rose-600">
                    {isRtl
                      ? `سعر الحصة لا يمكن أن يقل عن حصة المركز (${centerShare} EGP).`
                      : `Lesson price cannot be less than center share (${centerShare} EGP).`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Weekly Saturday & Tuesday session group"
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
                  disabled={!isPriceValid}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isRtl ? 'حفظ بيانات الفصل' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
