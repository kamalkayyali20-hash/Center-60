import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  DoorClosed,
  Plus,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassSession, SessionStatus } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { MetricCard } from '../common/MetricCard';
import { TimeFilterBar, TimeFilterPeriod } from '../common/TimeFilterBar';

export const SessionsDashboard: React.FC = () => {
  const {
    t,
    isRtl,
    classes,
    rooms,
    teachers,
    sessions,
    attendance,
    payments,
    openSession,
    updateSessionStatus,
    hasPermission,
    navigateToSessionDetail,
  } = useApp();

  // Time filter state - defaults to 'today' (sysday)
  const [period, setPeriod] = useState<TimeFilterPeriod>('today');
  const [specificDate, setSpecificDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [filterClass, setFilterClass] = useState<number | 'ALL'>('ALL');
  const [filterTeacher, setFilterTeacher] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Session Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 1);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(rooms[0]?.id || 1);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sysday string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter sessions by period
  const periodSessions = useMemo(() => {
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

  // Session conflict check for new session form
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const conflicts = useMemo(() => {
    if (!sessionDate || !startTime || !endTime) return [];
    return sessions.filter((s) => {
      if (s.sessionDate !== sessionDate) return false;
      if (s.status === 'CANCELLED') return false;
      const overlap = startTime < s.endTime && endTime > s.startTime;
      if (!overlap) return false;
      const sameRoom = s.roomId === selectedRoomId;
      const sameTeacher = s.teacherId === selectedClass?.teacherId;
      return sameRoom || sameTeacher;
    });
  }, [sessions, sessionDate, startTime, endTime, selectedRoomId, selectedClass]);

  // Overall KPI Metrics for Period
  const activeOpenSessions = periodSessions.filter((s) => s.status === 'OPEN').length;
  const completedSessions = periodSessions.filter((s) => s.status === 'COMPLETED').length;

  const periodPayments = useMemo(() => {
    const sessionIds = new Set(periodSessions.map((s) => s.id));
    return payments.filter((p) => sessionIds.has(p.sessionId) && !p.isCancelled);
  }, [payments, periodSessions]);

  const totalAttendees = periodPayments.length;
  const totalPeriodRevenue = periodPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Filtered displayed sessions
  const displayedSessions = useMemo(() => {
    return periodSessions.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (filterClass !== 'ALL' && s.classId !== filterClass) return false;
      if (filterTeacher !== 'ALL' && s.teacherId !== filterTeacher) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchClass = s.className.toLowerCase().includes(q);
        const matchTeacher = s.teacherName.toLowerCase().includes(q);
        const matchRoom = s.roomName.toLowerCase().includes(q);
        return matchClass || matchTeacher || matchRoom;
      }
      return true;
    });
  }, [periodSessions, statusFilter, filterClass, filterTeacher, searchQuery]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (conflicts.length > 0) {
      setFeedback({
        type: 'error',
        message: isRtl
          ? 'تعارض في المواعيد: القاعة أو المدرس محجوز بالفعل في هذا التوقيت!'
          : 'Conflict detected: Room or Teacher is already booked during this time interval.',
      });
      return;
    }

    const res = openSession(selectedClassId, selectedRoomId, sessionDate, startTime, endTime);
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
        title={isRtl ? 'لوحة تحكم الجلسات والحصص النشطة' : 'Sessions & Live Classes Dashboard'}
        subtitle={
          isRtl
            ? 'لوحة تفاعلية لمتابعة الجلسات المفتوحة والمنتهية، تسجيل الحضور، والولوج الفوري لشاشة تفاصيل الجلسة'
            : 'Interactive dashboard for active classroom sessions, real-time room bookings, and direct session detail access'
        }
        icon={Calendar}
        badge={isRtl ? 'جلسات قابلة للنقر' : 'Clickable Sessions'}
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: isRtl ? 'الجلسات والحصص' : 'Sessions Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'فتح / جدولة جلسة جديدة' : 'Open New Session'}</span>
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
        quickStatsSummary={`${displayedSessions.length} ${isRtl ? 'جلسة' : 'Sessions'}`}
      />

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={isRtl ? 'الجلسات المفتوحة والجارية' : 'Active / Open Sessions'}
          value={activeOpenSessions}
          subtitle={period === 'today' ? (isRtl ? 'جلسات اليوم (Sysday)' : 'Today (Sysday)') : `${period} active`}
          icon={<Play className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title={isRtl ? 'الجلسات المكتملة' : 'Completed Sessions'}
          value={completedSessions}
          subtitle={isRtl ? 'منتهية وجاهزة للتسوية' : 'Finished & ready to settle'}
          icon={<CheckCircle className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title={isRtl ? 'حضور الطلاب بالجلسات' : 'Student Attendees'}
          value={totalAttendees}
          subtitle={isRtl ? 'إجمالي المقبوضات' : 'Confirmed attendances'}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title={isRtl ? 'إيرادات الجلسات بالفترة' : 'Period Gross Collections'}
          value={`${totalPeriodRevenue.toLocaleString()} EGP`}
          subtitle={isRtl ? 'مجموع تحصيلات الحصص' : 'Total payments taken'}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* SESSIONS DASHBOARD CARDS & INTERACTIVE GRID */}
      <SectionCard
        title={isRtl ? 'جدول الجلسات والحصص النشطة (انقر على أي جلسة للتفاصيل)' : 'Active Sessions Dashboard (Click any session to open detail & attendance)'}
        subtitle={
          isRtl
            ? 'انقر على بطاقة الجلسة لفتح شاشة الحضور التفاعلية، اسم المعلم، المرحلة، وإضافة طلاب جدد'
            : 'Click any session to view its teacher, grade, student attendance list, and auto-save new student attendees'
        }
        badge={`${displayedSessions.length} ${isRtl ? 'جلسة' : 'Sessions'}`}
        icon={<Clock className="w-5 h-5 text-slate-700" />}
        headerAction={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث باسم الفصل، المدرس، القاعة...' : 'Search class, teacher, room...'}
                className="ps-8 pe-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{isRtl ? 'كافة الحالات' : 'All Status'}</option>
              <option value="OPEN">{isRtl ? 'مفتوحة / جارية (Open)' : 'Open / Live'}</option>
              <option value="COMPLETED">{isRtl ? 'مكتملة (Completed)' : 'Completed'}</option>
              <option value="CANCELLED">{isRtl ? 'ملغاة (Cancelled)' : 'Cancelled'}</option>
            </select>

            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{isRtl ? 'كافة المدرسين' : 'All Teachers'}</option>
              {teachers.map((tch) => (
                <option key={tch.id} value={tch.id}>
                  {tch.name}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {displayedSessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">
              {isRtl ? 'لا توجد جلسات مسجلة في الفترة المحددة' : 'No sessions found for the selected time filter.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isRtl
                ? 'يمكنك الضغط على زر "فتح / جدولة جلسة جديدة" بالأعلى لإضافة حصة'
                : 'Click "Open New Session" above to create a session for today.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedSessions.map((session) => {
              const sessionPayments = payments.filter((p) => p.sessionId === session.id && !p.isCancelled);
              const sessionAttendeesCount = sessionPayments.length;
              const sessionRevenue = sessionPayments.reduce((sum, p) => sum + p.amountPaid, 0);

              const statusColor =
                session.status === 'OPEN'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : session.status === 'COMPLETED'
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300';

              return (
                <div
                  key={session.id}
                  onClick={() => navigateToSessionDetail(session.id)}
                  className="group relative p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusColor}`}>
                        {session.status === 'OPEN'
                          ? isRtl ? '● جارية الآن (Open)' : '● Active / Open'
                          : session.status === 'COMPLETED'
                          ? isRtl ? 'مكتملة (Completed)' : 'Completed'
                          : isRtl ? 'ملغاة (Cancelled)' : 'Cancelled'}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                    </div>

                    {/* Class & Subject Title */}
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-cyan-600 transition-colors leading-snug mb-1">
                      {session.className}
                    </h4>

                    {/* Teacher & Room */}
                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>{session.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <DoorClosed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{session.roomName}</span>
                        <span>•</span>
                        <span>{session.sessionDate}</span>
                      </div>
                    </div>

                    {/* Tags for Grade & System */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      {session.gradeName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {session.gradeName}
                        </span>
                      )}
                      {session.systemName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          {session.systemName}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {session.lessonPrice} EGP
                      </span>
                    </div>
                  </div>

                  {/* Attendance & Revenue Snapshot */}
                  <div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {sessionAttendeesCount} {isRtl ? 'طالب حاضر' : 'Attendees'}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-xs text-emerald-700">
                        {sessionRevenue.toLocaleString()} EGP
                      </span>
                    </div>

                    {/* Interactive CTA to open details */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-cyan-600 group-hover:text-cyan-700">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'فتح شاشة تفاصيل الجلسة والغياب' : 'Open Attendance & Session Detail'}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 rtl:rotate-180 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* CREATE SESSION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isRtl ? 'فتح / جدولة جلسة جديدة' : 'Open New Class Session'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'حجز القاعة والتحقق الفوري من عدم تعارض المواعيد' : 'Select class & room with conflict detection'}
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

            <form onSubmit={handleCreateSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الفصل / المجموعة الدراسية *' : 'Academic Class / Group *'}
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {classes
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.teacherName} ({c.lessonPrice} EGP)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'القاعة / المدرج *' : 'Room / Auditorium *'}
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  {rooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {isRtl ? rm.nameAr : rm.nameEn} ({rm.capacity} {isRtl ? 'مقعد' : 'seats'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'تاريخ الجلسة *' : 'Session Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'وقت البدء' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'وقت الانتهاء' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Conflict banner */}
              {conflicts.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{isRtl ? 'تنبيه تعارض:' : 'Booking Collision:'}</span>{' '}
                    {isRtl
                      ? `القاعة أو المدرس محجوز بالفعل في هذا التوقيت (${conflicts.length} جلسة).`
                      : `${conflicts.length} overlapping session(s) detected.`}
                  </div>
                </div>
              )}

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
                  disabled={conflicts.length > 0}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isRtl ? 'فتح الجلسة' : 'Open Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
