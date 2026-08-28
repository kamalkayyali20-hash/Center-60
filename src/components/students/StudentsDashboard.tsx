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
  FileSpreadsheet,
  Trash2,
  Sliders,
  QrCode,
  Printer,
  ArrowUpRight,
  TrendingUp,
  Mail,
  User,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, ClassEntity, CardCustomizationConfig } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { MetricCard } from '../common/MetricCard';
import { TimeFilterBar, TimeFilterPeriod } from '../common/TimeFilterBar';
import { exportToExcel } from '../../utils/exportExcel';

export const StudentsDashboard: React.FC = () => {
  const {
    t,
    isRtl,
    students,
    classes,
    enrollments,
    grades,
    payments,
    saveStudent,
    deleteStudent,
    promoteStudentGrades,
    enrollStudent,
    unenrollStudent,
    hasPermission,
    currentUser,
    cardCustomizationConfig,
    setCardCustomizationConfig,
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentAltPhone, setParentAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');
  const [gradeId, setGradeId] = useState<number>(grades[0]?.id || 1);
  const [initialClassId, setInitialClassId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [studentFeedback, setStudentFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete Confirmation Modal
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);

  // Grade Promotion Modal
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [promotionScope, setPromotionScope] = useState<'ALL' | 'SELECTED'>('ALL');
  const [promotionFeedback, setPromotionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Card Customization Modal
  const [cardCustomizerOpen, setCardCustomizerOpen] = useState(false);
  const [tempCardConfig, setTempCardConfig] = useState<CardCustomizationConfig>(cardCustomizationConfig);

  // Enroll in Class State
  const [selectedClassToEnroll, setSelectedClassToEnroll] = useState<number>(classes[0]?.id || 1);
  const [enrollFeedback, setEnrollFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sysday string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter payments by period
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
        const matchName = s.name.toLowerCase().includes(q) || (s.firstName && s.firstName.toLowerCase().includes(q));
        const matchCode = s.code.toLowerCase().includes(q);
        const matchCenterId = String(s.centerId || s.id).includes(q);
        const matchUuid = (s.uuid || '').toLowerCase().includes(q);
        const matchPhone = s.phone.includes(q) || (s.altPhone && s.altPhone.includes(q));
        const matchParent =
          (s.parentFirstName && s.parentFirstName.toLowerCase().includes(q)) ||
          (s.guardianName && s.guardianName.toLowerCase().includes(q)) ||
          (s.parentPhone && s.parentPhone.includes(q)) ||
          (s.guardianPhone && s.guardianPhone.includes(q));
        return matchName || matchCode || matchCenterId || matchUuid || matchPhone || matchParent;
      }
      return true;
    });
  }, [students, gradeFilter, searchQuery]);

  // Active student's enrollments & payments
  const currentStudentEnrollments = useMemo(() => {
    if (!selectedStudent) return [];
    return enrollments.filter((e) => (e.studentId === selectedStudent.id || e.studentId === selectedStudent.centerId) && e.isActive);
  }, [enrollments, selectedStudent]);

  const currentStudentPeriodPayments = useMemo(() => {
    if (!selectedStudent) return [];
    return filteredPayments.filter((p) => p.studentId === selectedStudent.id || p.studentId === selectedStudent.centerId);
  }, [filteredPayments, selectedStudent]);

  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setAltPhone('');
    setEmail('');
    setParentFirstName('');
    setParentLastName('');
    setParentPhone('');
    setParentAltPhone('');
    setAddress('Cairo, Egypt');
    setSchool('');
    setGradeId(grades[0]?.id || 1);
    setInitialClassId('');
    setNotes('');
    setStudentFeedback(null);
    setStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setFirstName(s.firstName || s.name.split(' ')[0] || '');
    setLastName(s.lastName || s.name.split(' ').slice(1).join(' ') || '');
    setPhone(s.phone);
    setAltPhone(s.altPhone || '');
    setEmail(s.email || '');
    setParentFirstName(s.parentFirstName || s.guardianName?.split(' ')[0] || '');
    setParentLastName(s.parentLastName || s.guardianName?.split(' ').slice(1).join(' ') || '');
    setParentPhone(s.parentPhone || s.guardianPhone || '');
    setParentAltPhone(s.parentAltPhone || '');
    setAddress(s.address || '');
    setSchool(s.school || '');
    setGradeId(s.gradeId);
    setInitialClassId('');
    setNotes(s.notes || '');
    setStudentFeedback(null);
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFeedback(null);

    const res = saveStudent({
      id: editingStudent?.id,
      centerId: editingStudent?.centerId,
      uuid: editingStudent?.uuid,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      phone,
      altPhone,
      email,
      parentFirstName,
      parentLastName,
      parentPhone,
      parentAltPhone,
      guardianName: `${parentFirstName} ${parentLastName}`.trim(),
      guardianPhone: parentPhone,
      address,
      school,
      gradeId,
      notes,
      initialClassId: initialClassId ? Number(initialClassId) : undefined,
    });

    if (res.success) {
      setStudentFeedback({ type: 'success', message: res.message });
      if (res.student) {
        setSelectedStudent(res.student);
      }
      setTimeout(() => {
        setStudentModalOpen(false);
      }, 800);
    } else {
      setStudentFeedback({ type: 'error', message: res.message });
    }
  };

  const handleDeleteStudent = () => {
    if (!deleteConfirmStudent) return;
    const res = deleteStudent(deleteConfirmStudent.id);
    if (res.success) {
      setDeleteConfirmStudent(null);
      if (selectedStudent?.id === deleteConfirmStudent.id) {
        setSelectedStudent(students.find((s) => s.id !== deleteConfirmStudent.id) || null);
      }
    } else {
      alert(res.message);
    }
  };

  const handlePromoteGrades = () => {
    setPromotionFeedback(null);
    const target = promotionScope === 'ALL' ? 'ALL' : selectedStudent ? [selectedStudent.id] : 'ALL';
    const res = promoteStudentGrades(target);
    if (res.success) {
      setPromotionFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setPromotionModalOpen(false);
      }, 1200);
    } else {
      setPromotionFeedback({ type: 'error', message: res.message });
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

  // Export to Excel handler
  const handleExportStudentsExcel = () => {
    exportToExcel(
      filteredStudents,
      [
        { header: 'Center ID', accessor: (s) => s.centerId || s.id },
        { header: 'System Code', accessor: 'code' },
        { header: 'Student Name', accessor: 'name' },
        { header: 'Student Phone', accessor: 'phone' },
        { header: 'Alt Phone', accessor: (s) => s.altPhone || '—' },
        { header: 'Email', accessor: (s) => s.email || '—' },
        { header: 'Parent Name', accessor: (s) => s.parentFirstName ? `${s.parentFirstName} ${s.parentLastName || ''}` : s.guardianName || '—' },
        { header: 'Parent Phone', accessor: (s) => s.parentPhone || s.guardianPhone || '—' },
        { header: 'Parent Alt Phone', accessor: (s) => s.parentAltPhone || '—' },
        { header: 'Grade', accessor: (s) => s.gradeName || '—' },
        { header: 'School', accessor: (s) => s.school || '—' },
        { header: 'Address', accessor: (s) => s.address || '—' },
        { header: 'UUID', accessor: (s) => s.uuid || '—' },
        { header: 'Active Status', accessor: (s) => (s.isActive ? 'Active' : 'Inactive') },
        { header: 'Registration Date', accessor: (s) => s.registrationDate || '—' },
      ],
      '60_Center_Students_Directory',
      {
        title: 'Students Master Directory & Registry',
        filterPeriod: `${period.toUpperCase()} (${filteredStudents.length} Students)`,
        exportedBy: currentUser.fullName,
      }
    );
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={isRtl ? 'لوحة وسجل الطلاب والبطاقات الذكية' : 'Students Registry & Smart ID Cards'}
        subtitle={
          isRtl
            ? 'إدارة شاملة لملفات الطلاب، كود السنتر (100+)، أرقام أولياء الأمور، ترفيع الصفوف، وبطاقات الهوية'
            : 'Comprehensive student registry with Center IDs (100+), parent contacts, term promotions, and customizable ID cards'
        }
        icon={Users}
        badge={isRtl ? 'كود السنتر يبدأ من 100' : 'Center IDs starting at 100'}
        breadcrumbs={[
          { label: '60 Center' },
          { label: isRtl ? 'الطلاب والبطاقات' : 'Students & Cards' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportStudentsExcel}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? 'تصدير إكسيل (Excel)' : 'Export Excel'}</span>
            </button>

            {['ADMIN', 'OWNER', 'MANAGER'].includes(currentUser.role) && (
              <button
                type="button"
                onClick={() => {
                  setPromotionFeedback(null);
                  setPromotionModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>{isRtl ? 'ترفيع الصفوف (نهاية الترم)' : 'Promote Term Grades'}</span>
              </button>
            )}

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
        quickStatsSummary={`${filteredStudents.length} ${isRtl ? 'طالب مسجل' : 'Students'}`}
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricCard
          title={isRtl ? 'إجمالي الطلاب' : 'Registered Students'}
          value={totalActiveStudents}
          subtitle={`${students.length} ${isRtl ? 'سجل' : 'Total'}`}
          icon={<Users className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title={isRtl ? 'حضور الجلسات' : 'Sessions Attended'}
          value={periodAttendanceCount}
          subtitle={period === 'today' ? (isRtl ? 'اليوم' : 'Today') : `${period}`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title={isRtl ? 'مدفوعات الطلاب' : 'Student Payments'}
          value={`${periodTotalPaidByStudents.toLocaleString()} EGP`}
          subtitle={isRtl ? 'المقبوضات' : 'Collections'}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title={isRtl ? 'الاشتراكات الفعالة' : 'Active Enrollments'}
          value={enrollments.filter((e) => e.isActive).length}
          subtitle={isRtl ? 'ربط بالفصول' : 'Class linkages'}
          icon={<BookOpen className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: STUDENT DIRECTORY LIST (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <SectionCard
            title={isRtl ? 'دليل وقائمة الطلاب' : 'Student Directory'}
            subtitle={isRtl ? 'بحث بالاسم، كود السنتر (100+)، رقم ولي الأمر، أو الـ UUID' : 'Search by Name, Center ID (100+), Parent phone or UUID'}
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
                  placeholder={isRtl ? 'بحث بالاسم، كود 100، الهاتف، ولي الأمر...' : 'Search by Name, Center ID 100, Phone, Parent...'}
                  className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* Student Scroll List */}
              <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {isRtl ? 'لم يتم العثور على أي طلاب مطابقين للبحث' : 'No students found matching search criteria.'}
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudent?.id === s.id;
                    const studentCenterId = s.centerId || s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-cyan-50/80 border border-cyan-300 shadow-xs'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-cyan-400'
                          }`}>
                            <span className="text-[10px] opacity-70">ID</span>
                            <span className="font-mono text-xs">{studentCenterId}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900">{s.name}</h4>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {s.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {s.phone} • {s.gradeName || 'Grade'}
                            </p>
                            {(s.parentPhone || s.guardianPhone) && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {isRtl ? 'ولي الأمر:' : 'Parent:'} {s.parentFirstName ? `${s.parentFirstName} ${s.parentLastName || ''}` : s.guardianName} ({s.parentPhone || s.guardianPhone})
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditStudent(s);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-white rounded transition-colors"
                            title={isRtl ? 'تعديل بيانات الطالب' : 'Edit Student'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {['ADMIN', 'OWNER', 'MANAGER'].includes(currentUser.role) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmStudent(s);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                              title={isRtl ? 'حذف الطالب' : 'Delete Student'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: STUDENT PROFILE, SMART ID CARD & ENROLLMENT (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedStudent ? (
            <>
              {/* STUDENT PROFILE & SMART CARD */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 text-cyan-400 rounded-xl flex flex-col items-center justify-center font-bold shadow-xs">
                      <span className="text-[10px] text-cyan-400/70">ID</span>
                      <span className="font-mono text-sm">{selectedStudent.centerId || selectedStudent.id}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{selectedStudent.name}</h3>
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[11px] font-bold rounded-full">
                          {selectedStudent.gradeName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isRtl ? 'كود السنتر:' : 'Center ID:'} <strong className="font-mono text-slate-800">{selectedStudent.centerId || selectedStudent.id}</strong> | UUID: <span className="font-mono text-[10px] text-slate-400">{selectedStudent.uuid || '—'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCardCustomizerOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تخصيص الكارنيه' : 'Customize ID'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintCard}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'طباعة الكارنيه' : 'Print ID'}</span>
                    </button>
                  </div>
                </div>

                {/* VISUAL STUDENT ID CARD PREVIEW */}
                <div
                  className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transition-all mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${cardCustomizationConfig.themeColor || '#0891b2'}, #0f172a)`,
                  }}
                >
                  {/* Watermark Background */}
                  <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        {cardCustomizationConfig.showCenterLogo && (
                          <div className="w-7 h-7 bg-white text-slate-900 rounded-lg flex items-center justify-center font-black text-xs shadow-xs">
                            60
                          </div>
                        )}
                        <span className="font-black tracking-wider text-xs uppercase opacity-90">
                          {cardCustomizationConfig.centerName || '60 EDUCATION CENTER'}
                        </span>
                      </div>

                      <div className="mt-4">
                        {cardCustomizationConfig.showName && (
                          <h2 className="font-extrabold text-xl tracking-tight">{selectedStudent.name}</h2>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {cardCustomizationConfig.showCenterId && (
                            <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded-md font-bold text-cyan-300">
                              ID: {selectedStudent.centerId || selectedStudent.id}
                            </span>
                          )}
                          {cardCustomizationConfig.showGrade && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-semibold">
                              {selectedStudent.gradeName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* QR Code / Barcode representation */}
                    <div className="flex flex-col items-end gap-1">
                      {cardCustomizationConfig.showQrCode && (
                        <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                          <QrCode className="w-14 h-14 text-slate-900" />
                        </div>
                      )}
                      <span className="font-mono text-[9px] text-white/70">
                        {selectedStudent.code}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                    <div className="space-y-0.5">
                      {cardCustomizationConfig.showPhone && (
                        <p className="text-[11px] opacity-90">
                          <strong>Tel:</strong> <span className="font-mono">{selectedStudent.phone}</span>
                        </p>
                      )}
                      {cardCustomizationConfig.showParentPhone && (selectedStudent.parentPhone || selectedStudent.guardianPhone) && (
                        <p className="text-[11px] opacity-90">
                          <strong>Parent:</strong> <span className="font-mono">{selectedStudent.parentPhone || selectedStudent.guardianPhone}</span>
                        </p>
                      )}
                    </div>

                    {cardCustomizationConfig.showUuid && selectedStudent.uuid && (
                      <div className="text-end">
                        <span className="text-[9px] font-mono opacity-60 block">UUID AUTH TOKEN</span>
                        <span className="font-mono text-[10px] text-cyan-200">{selectedStudent.uuid.substring(0, 18)}...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* STUDENT CONTACT & DETAILS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{isRtl ? 'هاتف الطالب' : 'Student Phone'}</span>
                    <strong className="font-mono text-slate-800">{selectedStudent.phone}</strong>
                    {selectedStudent.altPhone && (
                      <span className="font-mono text-[10px] text-slate-500 block">Alt: {selectedStudent.altPhone}</span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{isRtl ? 'ولي الأمر' : 'Parent Contact'}</span>
                    <strong className="text-slate-800">
                      {selectedStudent.parentFirstName ? `${selectedStudent.parentFirstName} ${selectedStudent.parentLastName || ''}` : selectedStudent.guardianName || '—'}
                    </strong>
                    <span className="font-mono text-[11px] text-cyan-700 block mt-0.5">
                      {selectedStudent.parentPhone || selectedStudent.guardianPhone || '—'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{isRtl ? 'المدرسة والعنوان' : 'School & Address'}</span>
                    <strong className="text-slate-800 block truncate">{selectedStudent.school || '—'}</strong>
                    <span className="text-slate-500 text-[10px] truncate block">{selectedStudent.address || 'Cairo, Egypt'}</span>
                  </div>
                </div>
              </div>

              {/* ENROLL IN CLASS WIDGET */}
              <SectionCard
                title={isRtl ? 'تسجيل الطالب بفصل تعليمي جديد' : 'Enroll Student in Class'}
                subtitle={isRtl ? 'اختر الفصل لربط الطالب بمجموعة المدرس' : 'Link student to a teacher class & weekly schedule'}
                icon={<BookOpen className="w-5 h-5 text-cyan-600" />}
              >
                <form onSubmit={handleEnrollStudent} className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'اختر الفصل الدراسي' : 'Select Target Class'}
                    </label>
                    <select
                      value={selectedClassToEnroll}
                      onChange={(e) => setSelectedClassToEnroll(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.teacherName} ({c.lessonPrice} EGP)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الاشتراك' : 'Enroll in Class'}</span>
                  </button>
                </form>

                {enrollFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs mt-3 flex items-center gap-2 ${
                      enrollFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {enrollFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{enrollFeedback.message}</span>
                  </div>
                )}
              </SectionCard>

              {/* ACTIVE ENROLLMENTS LIST */}
              <SectionCard
                title={isRtl ? 'الفصول والمجموعات المسجل بها الطالب' : 'Current Active Class Enrollments'}
                subtitle={isRtl ? 'المجموعات المرتبطة بالطالب وجداول الحصص' : 'Enrolled classes, teacher links, and lesson pricing'}
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
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-slate-900">{enr.className}</h5>
                              {enr.status === 'PENDING_CONFIRMATION' && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                  {isRtl ? 'بانتظار موافقة المدرس' : 'Pending Approval'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {isRtl ? 'المدرس:' : 'Teacher:'} {enr.teacherName} • {isRtl ? 'تاريخ القيد:' : 'Enrolled:'}{' '}
                              {enr.enrollmentDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {classObj && (
                              <span className="font-mono font-bold text-xs text-cyan-800 bg-cyan-50 px-2 py-1 rounded border border-cyan-200">
                                {classObj.lessonPrice} EGP / {isRtl ? 'حصة' : 'lesson'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => unenrollStudent(enr.id)}
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1 rounded text-xs font-semibold"
                              title={isRtl ? 'إلغاء قيد الطالب من هذا الفصل' : 'Unenroll student'}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Period Payments & Attendance for this student */}
              <SectionCard
                title={isRtl ? 'سجلات الحضور والدفع بالفترة المحددة' : 'Period Session Attendance & Receipts'}
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-cyan-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingStudent
                      ? isRtl
                        ? `تعديل بيانات الطالب: ${editingStudent.name}`
                        : `Edit Student: ${editingStudent.name} (Center ID: ${editingStudent.centerId || editingStudent.id})`
                      : isRtl
                      ? 'تسجيل طالب جديد (كود السنتر 100+)'
                      : 'Register New Student (Center ID 100+)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'بيانات الطالب، رقم الهاتف، ولي الأمر، والمجموعة' : 'Student info, contact numbers, parent details, and grade level'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* STUDENT NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الاسم الأول للطالب *' : 'Student First Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Youssef"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'اسم العائلة / اللقب *' : 'Student Last Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Hisham"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* STUDENT PHONES */}
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
                    {isRtl ? 'هاتف بديل للطالب' : 'Student Alternative Phone'}
                  </label>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="011xxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PARENT CONTACT */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  {isRtl ? 'بيانات ولي الأمر (الأب / الأم)' : 'Parent / Guardian Contact'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'الاسم الأول لولي الأمر' : 'Parent First Name'}
                    </label>
                    <input
                      type="text"
                      value={parentFirstName}
                      onChange={(e) => setParentFirstName(e.target.value)}
                      placeholder="e.g. Hisham"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'اللقب لولي الأمر' : 'Parent Last Name'}
                    </label>
                    <input
                      type="text"
                      value={parentLastName}
                      onChange={(e) => setParentLastName(e.target.value)}
                      placeholder="e.g. Lotfy"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'رقم هاتف ولي الأمر الأساسي' : 'Parent Main Phone'}
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="012xxxxxxxx"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'رقم هاتف بديل لولي الأمر' : 'Parent Alt Phone'}
                    </label>
                    <input
                      type="tel"
                      value={parentAltPhone}
                      onChange={(e) => setParentAltPhone(e.target.value)}
                      placeholder="015xxxxxxxx"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* GRADE & INITIAL CLASS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {!editingStudent && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isRtl ? 'تسجيل بفصل مبدئي (اختياري)' : 'Initial Class Enrollment (Optional)'}
                    </label>
                    <select
                      value={initialClassId}
                      onChange={(e) => setInitialClassId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="">{isRtl ? '— بدون تسجيل فوري —' : '— No Immediate Class —'}</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.teacherName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SCHOOL & ADDRESS */}
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
                  placeholder="Special instructions or medical/academic notes"
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
                  {isRtl ? 'حفظ وتأكيد الطالب' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE PROMOTION MODAL */}
      {promotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isRtl ? 'ترفيع الصفوف الدراسية (نهاية العام/الترم)' : 'Promote Student Academic Grades'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'نقل الطلاب إلى الصف الأعلى في الترتيب الأكاديمي' : 'Promote students to next consecutive grade level'}
                </p>
              </div>
            </div>

            {promotionFeedback && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  promotionFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {promotionFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{promotionFeedback.message}</span>
              </div>
            )}

            <div className="space-y-3 text-xs mb-5">
              <p className="text-slate-600">
                {isRtl
                  ? 'سيتم ترفيع كل طالب إلى الصف الدراسي التالي (مثال: Grade 10 إلى Grade 11، و Grade 11 إلى Grade 12).'
                  : 'Every eligible student will be advanced to the next educational level based on grade hierarchy.'}
              </p>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="scope"
                    checked={promotionScope === 'ALL'}
                    onChange={() => setPromotionScope('ALL')}
                  />
                  <span>{isRtl ? 'ترفيع كافة طلاب السنتر المسجلين' : 'Promote All Registered Students in Center'}</span>
                </label>
                {selectedStudent && (
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="scope"
                      checked={promotionScope === 'SELECTED'}
                      onChange={() => setPromotionScope('SELECTED')}
                    />
                    <span>{isRtl ? `ترفيع الطالب المحدد فقط (${selectedStudent.name})` : `Promote Only Selected Student (${selectedStudent.name})`}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPromotionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handlePromoteGrades}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer shadow-xs"
              >
                {isRtl ? 'تنفيذ الترفيع الآن' : 'Execute Promotion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARD CUSTOMIZATION MODAL */}
      {cardCustomizerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {isRtl ? 'تخصيص تصميم وبيانات كارنيه الطالب' : 'Student ID Card Customizer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCardCustomizerOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'اسم السنتر على الكارنيه' : 'Center Name on Card'}
                </label>
                <input
                  type="text"
                  value={tempCardConfig.centerName}
                  onChange={(e) => setTempCardConfig({ ...tempCardConfig, centerName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'لون البطاقة الأساسي' : 'Primary Theme Color'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tempCardConfig.themeColor}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, themeColor: e.target.value })}
                    className="w-10 h-8 rounded cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-xs text-slate-600">{tempCardConfig.themeColor}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCardConfig.showName}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, showName: e.target.checked })}
                  />
                  <span>{isRtl ? 'إظهار اسم الطالب' : 'Show Student Name'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCardConfig.showCenterId}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, showCenterId: e.target.checked })}
                  />
                  <span>{isRtl ? 'إظهار كود السنتر (100+)' : 'Show Center ID'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCardConfig.showGrade}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, showGrade: e.target.checked })}
                  />
                  <span>{isRtl ? 'إظهار الصف الدراسي' : 'Show Grade'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCardConfig.showQrCode}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, showQrCode: e.target.checked })}
                  />
                  <span>{isRtl ? 'إظهار رمز QR' : 'Show QR Code'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCardConfig.showParentPhone}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, showParentPhone: e.target.checked })}
                  />
                  <span>{isRtl ? 'إظهار هاتف ولي الأمر' : 'Show Parent Phone'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempCardConfig.showUuid}
                    onChange={(e) => setTempCardConfig({ ...tempCardConfig, showUuid: e.target.checked })}
                  />
                  <span>{isRtl ? 'إظهار رمز UUID' : 'Show UUID'}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setCardCustomizerOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardCustomizationConfig(tempCardConfig);
                  setCardCustomizerOpen(false);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-lg cursor-pointer shadow-xs"
              >
                {isRtl ? 'حفظ إعدادات البطاقة' : 'Save Card Layout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STUDENT CONFIRMATION */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">{isRtl ? 'تأكيد حذف الطالب' : 'Confirm Student Deletion'}</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              {isRtl
                ? `هل أنت متأكد من رغبتك في حذف سجل الطالب "${deleteConfirmStudent.name}" (كود سنتر: ${deleteConfirmStudent.centerId || deleteConfirmStudent.id})؟ سيتم أيضاً حذف ارتباطاته بالفصول.`
                : `Are you sure you want to delete student "${deleteConfirmStudent.name}" (Center ID: ${deleteConfirmStudent.centerId || deleteConfirmStudent.id})? This will also remove all class enrollments.`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer shadow-xs"
              >
                {isRtl ? 'نعم، احذف الطالب' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
