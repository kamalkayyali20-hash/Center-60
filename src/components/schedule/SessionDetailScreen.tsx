import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Users,
  UserPlus,
  Clock,
  DoorClosed,
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Search,
  Check,
  CreditCard,
  Printer,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { MetricCard } from '../common/MetricCard';
import { PaymentMethod, AttendanceStatus, Student } from '../../types';

export const SessionDetailScreen: React.FC = () => {
  const {
    t,
    isRtl,
    selectedSessionId,
    setCurrentView,
    sessions,
    students,
    enrollments,
    attendance,
    payments,
    classes,
    processPayAndAttend,
    saveStudent,
    enrollStudent,
    updateSessionStatus,
    currentUser,
  } = useApp();

  // Active Session
  const session = useMemo(() => {
    if (!selectedSessionId) return sessions[0] || null;
    return sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;
  }, [sessions, selectedSessionId]);

  // Session Class
  const sessionClass = useMemo(() => {
    if (!session) return null;
    return classes.find((c) => c.id === session.classId) || null;
  }, [classes, session]);

  // Search in attendees
  const [attendeeSearch, setAttendeeSearch] = useState('');

  // Quick "Pay & Attend" for existing student modal/form
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number>(session?.lessonPrice || 250);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('PRESENT');
  const [markFeedback, setMarkFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // "Add New Student to this Session" modal (Auto-saves to student dashboard & enrolls)
  const [addNewStudentModalOpen, setAddNewStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentGuardianName, setNewStudentGuardianName] = useState('');
  const [newStudentGuardianPhone, setNewStudentGuardianPhone] = useState('');
  const [newStudentSchool, setNewStudentSchool] = useState('');
  const [newStudentPayNow, setNewStudentPayNow] = useState(true);
  const [newStudentPaymentMethod, setNewStudentPaymentMethod] = useState<PaymentMethod>('CASH');
  const [newStudentFeedback, setNewStudentFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync lesson price if session changes
  React.useEffect(() => {
    if (session) {
      setAmountPaid(session.lessonPrice);
    }
  }, [session]);

  // Enrollments in this class
  const classEnrollments = useMemo(() => {
    if (!session) return [];
    return enrollments.filter((e) => e.classId === session.classId && e.isActive);
  }, [enrollments, session]);

  // Attendance & Payments in this session
  const sessionAttendanceRecords = useMemo(() => {
    if (!session) return [];
    return attendance.filter((a) => a.sessionId === session.id);
  }, [attendance, session]);

  const sessionPayments = useMemo(() => {
    if (!session) return [];
    return payments.filter((p) => p.sessionId === session.id && !p.isCancelled);
  }, [payments, session]);

  // Merge enrolled students with their attendance status in this session
  const combinedRoster = useMemo(() => {
    if (!session) return [];

    // Map of students with attendance in this session
    const attendedMap = new Map(sessionAttendanceRecords.map((a) => [a.studentId, a]));
    const paidMap = new Map(sessionPayments.map((p) => [p.studentId, p]));

    // Start with enrolled students
    const list: Array<{
      studentId: number;
      name: string;
      code: string;
      isEnrolled: boolean;
      attendanceRecord?: any;
      paymentRecord?: any;
    }> = [];

    const processedStudentIds = new Set<number>();

    classEnrollments.forEach((enr) => {
      const studentObj = students.find((s) => s.id === enr.studentId);
      if (studentObj) {
        processedStudentIds.add(studentObj.id);
        list.push({
          studentId: studentObj.id,
          name: studentObj.name,
          code: studentObj.code,
          isEnrolled: true,
          attendanceRecord: attendedMap.get(studentObj.id),
          paymentRecord: paidMap.get(studentObj.id),
        });
      }
    });

    // Also include any students who attended/paid but were walk-ins
    sessionAttendanceRecords.forEach((att) => {
      if (!processedStudentIds.has(att.studentId)) {
        processedStudentIds.add(att.studentId);
        const studentObj = students.find((s) => s.id === att.studentId);
        list.push({
          studentId: att.studentId,
          name: att.studentName,
          code: att.studentCode,
          isEnrolled: false,
          attendanceRecord: att,
          paymentRecord: paidMap.get(att.studentId),
        });
      }
    });

    // Filter by search
    if (!attendeeSearch.trim()) return list;
    const q = attendeeSearch.toLowerCase();
    return list.filter((item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q));
  }, [session, classEnrollments, students, sessionAttendanceRecords, sessionPayments, attendeeSearch]);

  // Students available to mark (not yet attended)
  const availableToMarkStudents = useMemo(() => {
    if (!session) return [];
    const attendedIds = new Set(sessionAttendanceRecords.map((a) => a.studentId));
    return students.filter((s) => s.isActive && !attendedIds.has(s.id));
  }, [students, sessionAttendanceRecords, session]);

  // Metrics for this session
  const totalAttendedCount = sessionAttendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const totalGrossCollected = sessionPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalCenterEarned = sessionPayments.reduce((sum, p) => sum + p.centerShare, 0);
  const totalTeacherEarned = sessionPayments.reduce((sum, p) => sum + p.teacherShare, 0);

  if (!session) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 font-bold mb-3">{isRtl ? 'لم يتم تحديد أي جلسة' : 'No session selected'}</p>
        <button
          type="button"
          onClick={() => setCurrentView('classSchedules')}
          className="px-4 py-2 bg-slate-900 text-cyan-400 font-bold text-xs rounded-lg"
        >
          {isRtl ? 'العودة للوحة الجلسات' : 'Back to Sessions Dashboard'}
        </button>
      </div>
    );
  }

  // Handle Mark Attendance & Payment
  const handleProcessAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setMarkFeedback(null);

    if (!selectedStudentId) {
      setMarkFeedback({ type: 'error', message: isRtl ? 'يرجى اختيار طالب' : 'Please select a student' });
      return;
    }

    const res = processPayAndAttend({
      studentId: Number(selectedStudentId),
      sessionId: session.id,
      amountPaid,
      paymentMethod,
      attendanceStatus,
      receivedBy: `${currentUser.fullName} (${currentUser.role})`,
    });

    if (res.success) {
      setMarkFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setMarkModalOpen(false);
        setSelectedStudentId('');
      }, 700);
    } else {
      setMarkFeedback({ type: 'error', message: res.message });
    }
  };

  // Handle "Add New Student to this session" (Auto-save to students dashboard + auto-enroll + auto pay & attend)
  const handleAddNewStudentToSession = (e: React.FormEvent) => {
    e.preventDefault();
    setNewStudentFeedback(null);

    if (!newStudentName.trim() || !newStudentPhone.trim()) {
      setNewStudentFeedback({
        type: 'error',
        message: isRtl ? 'اسم الطالب ورقم الهاتف مطلوبان' : 'Student name and phone are required.',
      });
      return;
    }

    // 1. Save student to database / AppContext (Auto-saves to students dashboard)
    const saveRes = saveStudent({
      name: newStudentName.trim(),
      phone: newStudentPhone.trim(),
      guardianName: newStudentGuardianName.trim(),
      guardianPhone: newStudentGuardianPhone.trim(),
      school: newStudentSchool.trim(),
      gradeId: sessionClass?.gradeId || 1,
      notes: `Registered during active session: ${session.className}`,
    });

    if (!saveRes.success || !saveRes.student) {
      setNewStudentFeedback({ type: 'error', message: saveRes.message });
      return;
    }

    const createdStudent = saveRes.student;

    // 2. Auto-enroll in this class
    enrollStudent(createdStudent.id, session.classId);

    // 3. If pay now is checked, mark attendance & generate payment receipt
    if (newStudentPayNow) {
      processPayAndAttend({
        studentId: createdStudent.id,
        sessionId: session.id,
        amountPaid: session.lessonPrice,
        paymentMethod: newStudentPaymentMethod,
        attendanceStatus: 'PRESENT',
        receivedBy: `${currentUser.fullName} (${currentUser.role})`,
      });
    }

    setNewStudentFeedback({
      type: 'success',
      message: isRtl
        ? `تم حفظ الطالب (${createdStudent.name}) في قاعدة الطلاب وتسجيله بالجلسة بنجاح!`
        : `Student ${createdStudent.name} saved to Student Dashboard and attended session!`,
    });

    setTimeout(() => {
      setAddNewStudentModalOpen(false);
      setNewStudentName('');
      setNewStudentPhone('');
      setNewStudentGuardianName('');
      setNewStudentGuardianPhone('');
      setNewStudentSchool('');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Back Navigation */}
      <AppPageHeader
        title={session.className}
        subtitle={
          isRtl
            ? `شاشة تفاصيل الجلسة وقائمة الحضور وسجل المعلم (${session.teacherName})`
            : `Session detail workspace, student attendance ledger & teacher verification (${session.teacherName})`
        }
        icon={Clock}
        badge={session.status === 'OPEN' ? (isRtl ? 'جلسة جارية' : 'Live Session') : session.status}
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: isRtl ? 'لوحة الجلسات' : 'Sessions Dashboard', onClick: () => setCurrentView('classSchedules') },
          { label: isRtl ? 'تفاصيل الجلسة' : 'Session Detail' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('classSchedules')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{isRtl ? 'العودة للجلسات' : 'Back to Sessions'}</span>
            </button>

            {session.status === 'OPEN' && (
              <button
                type="button"
                onClick={() => updateSessionStatus(session.id, 'COMPLETED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isRtl ? 'إنهاء الجلسة (Complete)' : 'Close / Complete Session'}</span>
              </button>
            )}
          </div>
        }
      />

      {/* SESSION OVERVIEW BANNER (Teacher Name, Grade, Room, Date & Revenue Split) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Core Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {session.systemName || 'Education System'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {session.gradeName || 'Grade Level'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {session.sessionDate} • {session.startTime} - {session.endTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{session.className}</h2>

            <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white">{isRtl ? 'المدرس:' : 'Teacher:'}</span>
                <span>{session.teacherName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DoorClosed className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white">{isRtl ? 'القاعة:' : 'Room:'}</span>
                <span>{session.roomName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">{isRtl ? 'سعر الحصة:' : 'Lesson Fee:'}</span>
                <span className="font-mono font-bold text-emerald-300">{session.lessonPrice} EGP</span>
              </div>
            </div>
          </div>

          {/* Right: Revenue Split Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center shrink-0">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isRtl ? 'إجمالي التحصيل' : 'Gross Intake'}</div>
              <div className="text-base font-extrabold font-mono text-emerald-400">
                {totalGrossCollected.toLocaleString()} EGP
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isRtl ? 'حصة المركز' : 'Center Retained'}</div>
              <div className="text-base font-extrabold font-mono text-cyan-400">
                {totalCenterEarned.toLocaleString()} EGP
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isRtl ? 'مستحق المدرس' : 'Teacher Share'}</div>
              <div className="text-base font-extrabold font-mono text-amber-400">
                {totalTeacherEarned.toLocaleString()} EGP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={isRtl ? 'الطلاب الحاضرون' : 'Confirmed Attendees'}
          value={totalAttendedCount}
          subtitle={`${combinedRoster.length} ${isRtl ? 'إجمالي كشف الجلسة' : 'Total on Roster'}`}
          icon={<Users className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title={isRtl ? 'نسبة حضور المقيدين' : 'Attendance Rate'}
          value={classEnrollments.length > 0 ? `${Math.round((totalAttendedCount / classEnrollments.length) * 100)}%` : '100%'}
          subtitle={`${classEnrollments.length} ${isRtl ? 'مقيد بالفصل' : 'Enrolled in Class'}`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title={isRtl ? 'الإيصالات المصدرة' : 'Receipts Issued'}
          value={sessionPayments.length}
          subtitle={isRtl ? 'تحصيلات نقدية/إلكترونية' : 'Processed payments'}
          icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title={isRtl ? 'صافي دخل المدرس للجلسة' : 'Teacher Earned (Session)'}
          value={`${totalTeacherEarned.toLocaleString()} EGP`}
          subtitle={`+${session.teacherShare} EGP / ${isRtl ? 'طالب' : 'student'}`}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* STUDENT ATTENDANCE & ROSTER SECTION */}
      <SectionCard
        title={isRtl ? 'كشف حضور وغياب الطلاب بالجلسة' : 'Student Attendance & Payment Ledger'}
        subtitle={
          isRtl
            ? 'سجل الحضور اللحظي، حالة الدفع، إمكانية تسجيل طالب مسجل أو إضافة طالب جديد للجلسة وحفظه تلقائياً'
            : 'Live attendance list, receipt statuses, and quick student attendance processing'
        }
        badge={`${combinedRoster.length} ${isRtl ? 'طالب' : 'Students'}`}
        icon={<Users className="w-5 h-5 text-slate-700" />}
        headerAction={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
              <input
                type="text"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder={isRtl ? 'بحث في الكشف...' : 'Search roster...'}
                className="ps-8 pe-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 w-36 sm:w-48"
              />
            </div>

            {/* Quick Mark Attendance Button */}
            <button
              type="button"
              onClick={() => {
                setMarkFeedback(null);
                setMarkModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-cyan-600" />
              <span>{isRtl ? 'تسجيل حضور طالب مسجل' : 'Mark Existing Student'}</span>
            </button>

            {/* CRITICAL REQUESTED BUTTON: Add New Student to this session (Auto-saves to student dashboard) */}
            <button
              type="button"
              onClick={() => {
                setNewStudentFeedback(null);
                setAddNewStudentModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRtl ? '+ إضافة طالب جديد للجلسة' : '+ Add New Student to Session'}</span>
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 text-start">{isRtl ? 'الطالب' : 'Student'}</th>
                <th className="p-3 text-start">{isRtl ? 'كود الطالب' : 'Student Code'}</th>
                <th className="p-3 text-start">{isRtl ? 'حالة القيد' : 'Enrollment'}</th>
                <th className="p-3 text-start">{isRtl ? 'حالة الحضور' : 'Attendance'}</th>
                <th className="p-3 text-start">{isRtl ? 'الدفع والإيصال' : 'Payment & Receipt'}</th>
                <th className="p-3 text-end">{isRtl ? 'المبلغ المدفوع' : 'Amount Paid'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedRoster.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {isRtl
                      ? 'لا يوجد طلاب في كشف هذه الجلسة. استخدم زر "+ إضافة طالب جديد للجلسة" بالأعلى.'
                      : 'No students in this session yet. Click "+ Add New Student to Session" above.'}
                  </td>
                </tr>
              ) : (
                combinedRoster.map((item) => {
                  const hasAttended = !!item.attendanceRecord;
                  const payment = item.paymentRecord;

                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600">{item.code}</td>
                      <td className="p-3">
                        {item.isEnrolled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                            {isRtl ? 'مقيد بالفصل' : 'Enrolled'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {isRtl ? 'حضور مباشر (Walk-in)' : 'Walk-in'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {hasAttended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{item.attendanceRecord.status}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            {isRtl ? 'لم يحضر بعد' : 'Not Attended'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {payment ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-800 text-[11px]">
                              {payment.receiptNumber}
                            </span>
                            <div className="text-[10px] text-slate-400">{payment.paymentMethod}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">{isRtl ? 'غير مسدد' : 'Unpaid'}</span>
                        )}
                      </td>
                      <td className="p-3 text-end font-mono font-bold">
                        {payment ? (
                          <span className="text-emerald-700 font-extrabold text-xs">{payment.amountPaid} EGP</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(item.studentId);
                              setMarkFeedback(null);
                              setMarkModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            {isRtl ? 'سداد وحضور' : 'Pay & Attend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* MODAL 1: MARK EXISTING STUDENT ATTENDANCE */}
      {markModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {isRtl ? 'تسجيل حضور وسداد طالب' : 'Process Pay & Attend'}
              </h3>
              <button
                type="button"
                onClick={() => setMarkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {markFeedback && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  markFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {markFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{markFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleProcessAttendance} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اختيار الطالب *' : 'Select Student *'}
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="">{isRtl ? '-- اختر طالباً --' : '-- Select a Student --'}</option>
                  {availableToMarkStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.gradeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المبلغ المحصل (EGP)' : 'Amount Paid (EGP)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'طريقة الدفع' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="CASH">CASH (نقدي)</option>
                    <option value="CARD">CARD (بطاقة)</option>
                    <option value="VODAFONE_CASH">Vodafone Cash</option>
                    <option value="INSTAPAY">InstaPay</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMarkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isRtl ? 'تسجيل الحضور والدفع' : 'Confirm Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW STUDENT TO THIS SESSION (AUTO-SAVES TO STUDENT DASHBOARD) */}
      {addNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isRtl ? 'إضافة طالب جديد للجلسة' : 'Add New Student to this Session'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl
                      ? 'يتم حفظ بيانات الطالب تلقائياً في قاعدة ولوحة الطلاب وإلحاقه بالجلسة'
                      : 'Auto-saves student record directly to Student Dashboard & marks attendance'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddNewStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {newStudentFeedback && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  newStudentFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {newStudentFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{newStudentFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleAddNewStudentToSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اسم الطالب بالكامل *' : 'Student Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Mostafa Tarek"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'رقم هاتف الطالب *' : 'Student Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المدرسة' : 'School'}
                  </label>
                  <input
                    type="text"
                    value={newStudentSchool}
                    onChange={(e) => setNewStudentSchool(e.target.value)}
                    placeholder="e.g. St. George College"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'اسم ولي الأمر' : 'Guardian Name'}
                  </label>
                  <input
                    type="text"
                    value={newStudentGuardianName}
                    onChange={(e) => setNewStudentGuardianName(e.target.value)}
                    placeholder="e.g. Tarek Mansour"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'هاتف ولي الأمر' : 'Guardian Phone'}
                  </label>
                  <input
                    type="tel"
                    value={newStudentGuardianPhone}
                    onChange={(e) => setNewStudentGuardianPhone(e.target.value)}
                    placeholder="011xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Instant Pay & Attend Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStudentPayNow}
                    onChange={(e) => setNewStudentPayNow(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {isRtl
                      ? `سداد الحصة فوراً (${session.lessonPrice} EGP) وتأكيد الحضور`
                      : `Collect lesson fee (${session.lessonPrice} EGP) & mark present now`}
                  </span>
                </label>

                {newStudentPayNow && (
                  <div className="pt-2 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-600">{isRtl ? 'طريقة الدفع:' : 'Method:'}</label>
                    <select
                      value={newStudentPaymentMethod}
                      onChange={(e) => setNewStudentPaymentMethod(e.target.value as any)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="CASH">CASH (نقدي)</option>
                      <option value="CARD">CARD (بطاقة)</option>
                      <option value="VODAFONE_CASH">Vodafone Cash</option>
                      <option value="INSTAPAY">InstaPay</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddNewStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ الطالب وتأكيد الحضور' : 'Auto-Save Student & Attend'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
