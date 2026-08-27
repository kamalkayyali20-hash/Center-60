import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Plus,
  BookOpen,
  Phone,
  Calendar,
  School,
  DollarSign,
  Clock,
  Edit,
  ShieldCheck,
  Award,
  UserCheck,
  UserX,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, ClassEntity } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { MetricCard } from '../common/MetricCard';
import { TimeFilterBar, TimeFilterPeriod } from '../common/TimeFilterBar';

export const StudentsDashboard: React.FC = () => {
  const {
    t,
    isRtl,
    students,
    classes,
    enrollments,
    grades,
    sessions,
    attendance,
    payments,
    saveStudent,
    enrollStudent,
    hasPermission,
    navigateToSessionDetail,
  } = useApp();

  // Time filter state - defaults to 'today' (sysday)
  const [period, setPeriod] = useState<TimeFilterPeriod>('today');
  const [specificDate, setSpecificDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'ALL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null);

  // Add/Edit Student Modal
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');
  const [gradeId, setGradeId] = useState<number>(grades[0]?.id || 1);
  const [notes, setNotes] = useState('');
  const [studentFeedback, setStudentFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Enroll in Class State
  const [selectedClassToEnroll, setSelectedClassToEnroll] = useState<number>(classes[0]?.id || 1);
  const [enrollFeedback, setEnrollFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sysday string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter payments and attendance by period
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.isCancelled) return false;
      const paymentDay = p.paymentDate.split(' ')[0];
      if (period === 'all') return true;
      if (period === 'today') return paymentDay === todayStr;
      if (period === 'specific') return paymentDay === specificDate;
      if (period === 'week') {
        const d = new Date(paymentDay);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === 'month') {
        const d = new Date(paymentDay);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      return true;
    });
  }, [payments, period, todayStr, specificDate]);

  // Overall KPI stats
  const totalActiveStudents = students.filter((s) => s.isActive).length;
  const periodAttendanceCount = filteredPayments.length;
  const periodTotalPaidByStudents = filteredPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (gradeFilter !== 'ALL' && s.gradeId !== gradeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchCode = s.code.toLowerCase().includes(q);
        const matchPhone = s.phone.includes(q);
        const matchGuardian = (s.guardianName || '').toLowerCase().includes(q);
        return matchName || matchCode || matchPhone || matchGuardian;
      }
      return true;
    });
  }, [students, gradeFilter, searchQuery]);

  // Active student's enrollments & payments
  const currentStudentEnrollments = useMemo(() => {
    if (!selectedStudent) return [];
    return enrollments.filter((e) => e.studentId === selectedStudent.id && e.isActive);
  }, [enrollments, selectedStudent]);

  const currentStudentPeriodPayments = useMemo(() => {
    if (!selectedStudent) return [];
    return filteredPayments.filter((p) => p.studentId === selectedStudent.id);
  }, [filteredPayments, selectedStudent]);

  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setName('');
    setPhone('');
    setGuardianName('');
    setGuardianPhone('');
    setAddress('');
    setSchool('');
    setGradeId(grades[0]?.id || 1);
    setNotes('');
    setStudentFeedback(null);
    setStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setPhone(s.phone);
    setGuardianName(s.guardianName || '');
    setGuardianPhone(s.guardianPhone || '');
    setAddress(s.address || '');
    setSchool(s.school || '');
    setGradeId(s.gradeId);
    setNotes(s.notes || '');
    setStudentFeedback(null);
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFeedback(null);

    const res = saveStudent({
      id: editingStudent?.id,
      name,
      phone,
      guardianName,
      guardianPhone,
      address,
      school,
      gradeId,
      notes,
    });

    if (res.success) {
      setStudentFeedback({ type: 'success', message: res.message });
      if (res.student) {
        setSelectedStudent(res.student);
      }
      setTimeout(() => {
        setStudentModalOpen(false);
      }, 700);
    } else {
      setStudentFeedback({ type: 'error', message: res.message });
    }
  };

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollFeedback(null);

    if (!selectedStudent) return;

    const res = enrollStudent(selectedStudent.id, selectedClassToEnroll);
    if (res.success) {
      setEnrollFeedback({ type: 'success', message: res.message });
    } else {
      setEnrollFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={isRtl ? 'لوحة تحكم وسجل الطلاب والاشتراكات' : 'Students & Enrollments Dashboard'}
        subtitle={
          isRtl
            ? 'لوحة شاملة لمتابعة الطلاب، الاشتراكات بالفصول، حضور الجلسات، وسجلات الدفع والتحصيل'
            : 'Comprehensive student registry, class enrollments, session attendance records, and payment history'
        }
        icon={Users}
        badge={isRtl ? 'لوحة بيانات تفاعلية' : 'Active Registry'}
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: isRtl ? 'الطلاب والاشتراكات' : 'Students & Enrollments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewStudent}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRtl ? 'تسجيل طالب جديد' : 'New Student'}</span>
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
        quickStatsSummary={`${filteredStudents.length} ${isRtl ? 'طالب' : 'Students'}`}
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={isRtl ? 'إجمالي الطلاب المسجلين' : 'Registered Students'}
          value={totalActiveStudents}
          subtitle={`${students.length} ${isRtl ? 'سجل في القاعدة' : 'Total in Database'}`}
          icon={<Users className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title={isRtl ? 'حضور الجلسات بالفترة' : 'Period Sessions Attended'}
          value={periodAttendanceCount}
          subtitle={period === 'today' ? (isRtl ? 'حضور اليوم (Sysday)' : 'Today (Sysday)') : `${period} attendance`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title={isRtl ? 'مدفوعات الطلاب بالفترة' : 'Period Student Payments'}
          value={`${periodTotalPaidByStudents.toLocaleString()} EGP`}
          subtitle={isRtl ? 'إجمالي المقبوضات' : 'Gross collections'}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title={isRtl ? 'إجمالي الاشتراكات الفعالة' : 'Active Class Enrollments'}
          value={enrollments.filter((e) => e.isActive).length}
          subtitle={isRtl ? 'ربط الطلاب بالفصول' : 'Class linkages'}
          icon={<BookOpen className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD (Master List & Student Detail Profile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / TOP: STUDENT DIRECTORY LIST (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <SectionCard
            title={isRtl ? 'دليل وقائمة الطلاب' : 'Student Directory'}
            subtitle={isRtl ? 'اختر طالباً لعرض ملفه واشتراكاته' : 'Select a student to view full profile & enrollments'}
            badge={`${filteredStudents.length}`}
            headerAction={
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">{isRtl ? 'كافة الصفوف' : 'All Grades'}</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {isRtl ? g.nameAr : g.nameEn}
                  </option>
                ))}
              </select>
            }
          >
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'بحث بالاسم، الكود، الهاتف، ولي الأمر...' : 'Search name, code, phone, guardian...'}
                  className="w-full ps-8 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* Scrollable list */}
              <div className="space-y-2 max-h-[560px] overflow-y-auto pe-1">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    {isRtl ? 'لا يوجد طلاب مطابقين للبحث' : 'No students found matching search criteria'}
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudent?.id === s.id;
                    const studentEnrolls = enrollments.filter((e) => e.studentId === s.id && e.isActive);

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-50/70 border-cyan-400 shadow-xs ring-1 ring-cyan-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{s.name}</h4>
                              <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-100/70 px-1.5 py-0.2 rounded">
                                {s.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{s.phone}</span>
                              <span>•</span>
                              <span>{s.gradeName}</span>
                            </p>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                            {studentEnrolls.length} {isRtl ? 'فصول' : 'Classes'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: STUDENT PROFILE, ENROLLMENTS & PERIOD SESSIONS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedStudent ? (
            <>
              {/* Profile Card */}
              <SectionCard
                title={selectedStudent.name}
                subtitle={`${selectedStudent.code} • ${selectedStudent.gradeName}`}
                badge={selectedStudent.isActive ? (isRtl ? 'نشط' : 'Active') : isRtl ? 'غير نشط' : 'Inactive'}
                icon={<GraduationCap className="w-5 h-5 text-cyan-600" />}
                headerAction={
                  <button
                    type="button"
                    onClick={() => handleOpenEditStudent(selectedStudent)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تعديل البيانات' : 'Edit Profile'}</span>
                  </button>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? 'هاتف الطالب' : 'Student Phone'}</span>
                    <p className="font-mono font-bold text-slate-900">{selectedStudent.phone || '-'}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? 'ولي الأمر' : 'Guardian'}</span>
                    <p className="font-semibold text-slate-900">
                      {selectedStudent.guardianName || '-'} ({selectedStudent.guardianPhone || '-'})
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? 'المدرسة' : 'School'}</span>
                    <p className="font-semibold text-slate-900">{selectedStudent.school || '-'}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? 'العنوان' : 'Address'}</span>
                    <p className="font-semibold text-slate-900">{selectedStudent.address || '-'}</p>
                  </div>
                </div>
              </SectionCard>

              {/* Enroll in Class Widget */}
              <SectionCard
                title={isRtl ? 'تسجيل الطالب في فصل / مجموعة' : 'Enroll in Class'}
                subtitle={isRtl ? 'إلحاق الطالب بمجموعة دراسية جديدة' : 'Link student to an active course curriculum'}
                icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
              >
                {enrollFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs mb-3 flex items-center gap-2 ${
                      enrollFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {enrollFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{enrollFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleEnrollStudent} className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <select
                      value={selectedClassToEnroll}
                      onChange={(e) => setSelectedClassToEnroll(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      {classes
                        .filter((c) => c.isActive)
                        .map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.teacherName}) - {cls.lessonPrice} EGP
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? 'تأكيد التسجيل بالفصل' : 'Enroll in Class'}</span>
                  </button>
                </form>
              </SectionCard>

              {/* Current Active Enrollments */}
              <SectionCard
                title={isRtl ? 'الفصول والمجموعات المقيد بها' : 'Active Class Enrollments'}
                subtitle={isRtl ? 'المجموعات الدراسية المسجل بها الطالب حالياً' : 'Curriculums and teacher classes the student attends'}
                badge={`${currentStudentEnrollments.length}`}
                icon={<GraduationCap className="w-5 h-5 text-slate-700" />}
              >
                {currentStudentEnrollments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    {isRtl ? 'الطالب غير مقيد بأي فصول حالياً' : 'Student is not enrolled in any classes yet.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentStudentEnrollments.map((enr) => {
                      const classObj = classes.find((c) => c.id === enr.classId);
                      return (
                        <div
                          key={enr.id}
                          className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3"
                        >
                          <div>
                            <h5 className="font-bold text-xs text-slate-900">{enr.className}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {isRtl ? 'المدرس:' : 'Teacher:'} {enr.teacherName} • {isRtl ? 'تاريخ القيد:' : 'Enrolled:'}{' '}
                              {enr.enrollmentDate}
                            </p>
                          </div>
                          {classObj && (
                            <span className="font-mono font-bold text-xs text-cyan-800 bg-cyan-50 px-2 py-1 rounded border border-cyan-200">
                              {classObj.lessonPrice} EGP / {isRtl ? 'حصة' : 'lesson'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Period Payments & Attendance for this student */}
              <SectionCard
                title={isRtl ? 'حضور الجلسات والمدفوعات بالفترة المحددة' : 'Period Session Attendance & Receipts'}
                subtitle={
                  isRtl
                    ? `سجلات الحضور والدفع خلال (${period === 'today' ? 'اليوم' : period})`
                    : `Attendance & verified payments in selected period (${period})`
                }
                badge={`${currentStudentPeriodPayments.length} ${isRtl ? 'عملية' : 'Records'}`}
                icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
              >
                {currentStudentPeriodPayments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    {isRtl
                      ? 'لا توجد جلسات أو مدفوعات مسجلة للطالب في الفترة المحددة'
                      : 'No session attendance or payments found for this student in the selected period.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentStudentPeriodPayments.map((pmt) => (
                      <div
                        key={pmt.id}
                        className="p-3 rounded-lg border border-slate-200 bg-emerald-50/30 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs text-slate-900">{pmt.className}</h5>
                            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                              {pmt.receiptNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {pmt.paymentDate} • {isRtl ? 'المحصل:' : 'Cashier:'} {pmt.receivedBy}
                          </p>
                        </div>
                        <div className="text-end">
                          <span className="font-mono font-extrabold text-sm text-emerald-700">
                            {pmt.amountPaid} EGP
                          </span>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">{pmt.paymentMethod}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              {isRtl ? 'يرجى اختيار طالب من القائمة' : 'Please select a student from the directory'}
            </div>
          )}
        </div>
      </div>

      {/* STUDENT ADD/EDIT MODAL */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingStudent
                      ? isRtl
                        ? `تعديل بيانات الطالب: ${editingStudent.name}`
                        : `Edit Student: ${editingStudent.name}`
                      : isRtl
                      ? 'تسجيل طالب جديد'
                      : 'Register New Student'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'بيانات الطالب، المدرسة، ورقم ولي الأمر' : 'Student details, grade level and guardian contact'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {studentFeedback && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  studentFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {studentFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{studentFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اسم الطالب بالكامل *' : 'Student Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Youssef Hisham"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الصف الدراسي *' : 'Grade Level *'}
                  </label>
                  <select
                    value={gradeId}
                    onChange={(e) => setGradeId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {isRtl ? g.nameAr : g.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'اسم ولي الأمر' : 'Guardian Name'}
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Hisham Lotfy"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'رقم هاتف ولي الأمر' : 'Guardian Phone'}
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="011xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المدرسة' : 'School'}
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Victoria College"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'العنوان' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Maadi, Cairo"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions or student notes"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isRtl ? 'حفظ بيانات الطالب' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
