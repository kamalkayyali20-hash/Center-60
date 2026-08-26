import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Save,
  PlusCircle,
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  Layers,
  Lock,
  Calculator,
  UserCheck,
  UserX,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Teacher, ClassEntity } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';

export const TeacherClassManager: React.FC = () => {
  const {
    t,
    isRtl,
    teachers,
    classes,
    subjects,
    grades,
    educationSystems,
    saveTeacher,
    deactivateTeacher,
    saveClass,
    deactivateClass,
    hasPermission,
  } = useApp();

  // --- TEACHER FORM STATE ---
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(1); // Default to Karim Mostafa
  const [teacherName, setTeacherName] = useState('Karim Mostafa');
  const [teacherPhone, setTeacherPhone] = useState('01012345678');
  const [teacherEmail, setTeacherEmail] = useState('karim.mostafa@60center.com');
  const [teacherAddress, setTeacherAddress] = useState('Nasr City, Cairo');
  const [teacherHireDate, setTeacherHireDate] = useState('2023-09-01');
  const [teacherNotes, setTeacherNotes] = useState('Senior Physics Specialist (IG & American)');
  const [teacherIsActive, setTeacherIsActive] = useState(true);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- CLASS FORM STATE ---
  const [selectedClassId, setSelectedClassId] = useState<number | null>(1);
  const [classTeacherId, setClassTeacherId] = useState<number>(1);
  const [className, setClassName] = useState('Physics - Grade 12 (IG)');
  const [classSubjectId, setClassSubjectId] = useState<number>(1); // Physics
  const [classGradeId, setClassGradeId] = useState<number>(5);     // Grade 12
  const [classSystemId, setClassSystemId] = useState<number>(3);    // IG
  const [lessonPrice, setLessonPrice] = useState<number>(350);
  const [classIsActive, setClassIsActive] = useState(true);
  const [classNotes, setClassNotes] = useState('Primary IG Physics Group with weekly past paper workshops');
  const [classFeedback, setClassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter & Search for Classes Table
  const [tableSearch, setTableSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<number | 'ALL'>('ALL');
  const [filterGrade, setFilterGrade] = useState<number | 'ALL'>('ALL');
  const [filterSystem, setFilterSystem] = useState<number | 'ALL'>('ALL');

  // AUTO READ-ONLY FINANCIAL CALCULATIONS
  const selectedSystem = useMemo(() => {
    return educationSystems.find((sys) => sys.id === classSystemId) || educationSystems[0];
  }, [educationSystems, classSystemId]);

  const centerShare = selectedSystem ? selectedSystem.currentCenterShare : 0;
  const teacherShare = Math.max(0, (lessonPrice || 0) - centerShare);
  const isPriceValid = (lessonPrice || 0) >= centerShare;

  // Sync Class Name when Subject/Grade/System change if user hasn't modified it arbitrarily
  const handleSystemChange = (systemId: number) => {
    setClassSystemId(systemId);
    const sub = subjects.find((s) => s.id === classSubjectId);
    const grd = grades.find((g) => g.id === classGradeId);
    const sys = educationSystems.find((s) => s.id === systemId);
    if (sub && grd && sys) {
      setClassName(`${sub.nameEn} - ${grd.nameEn} (${sys.nameEn})`);
    }
  };

  // Reset / New Teacher
  const handleNewTeacher = () => {
    setSelectedTeacherId(null);
    setTeacherName('');
    setTeacherPhone('');
    setTeacherEmail('');
    setTeacherAddress('');
    setTeacherHireDate(new Date().toISOString().split('T')[0]);
    setTeacherNotes('');
    setTeacherIsActive(true);
    setTeacherFeedback(null);
  };

  // Load Teacher into Form
  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacherId(teacher.id);
    setTeacherName(teacher.name);
    setTeacherPhone(teacher.phone);
    setTeacherEmail(teacher.email);
    setTeacherAddress(teacher.address);
    setTeacherHireDate(teacher.hireDate);
    setTeacherNotes(teacher.notes);
    setTeacherIsActive(teacher.isActive);
    setClassTeacherId(teacher.id);
    setTeacherFeedback(null);
  };

  // Save Teacher
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFeedback(null);
    const res = saveTeacher({
      id: selectedTeacherId || undefined,
      name: teacherName,
      phone: teacherPhone,
      email: teacherEmail,
      address: teacherAddress,
      hireDate: teacherHireDate,
      notes: teacherNotes,
      isActive: teacherIsActive,
    });

    if (res.success) {
      setTeacherFeedback({ type: 'success', message: res.message });
      if (res.teacher) {
        setSelectedTeacherId(res.teacher.id);
        setClassTeacherId(res.teacher.id);
      }
    } else {
      setTeacherFeedback({ type: 'error', message: res.message });
    }
  };

  // Reset / New Class
  const handleNewClass = () => {
    setSelectedClassId(null);
    const sub = subjects[0];
    const grd = grades[0];
    const sys = educationSystems[0];
    setClassName(sub && grd && sys ? `${sub.nameEn} - ${grd.nameEn} (${sys.nameEn})` : 'New Class');
    setClassSubjectId(sub ? sub.id : 1);
    setClassGradeId(grd ? grd.id : 1);
    setClassSystemId(sys ? sys.id : 1);
    setLessonPrice(250);
    setClassIsActive(true);
    setClassNotes('');
    setClassFeedback(null);
  };

  // Load Class into Form for editing
  const handleSelectClass = (cls: ClassEntity) => {
    setSelectedClassId(cls.id);
    setClassTeacherId(cls.teacherId);
    setClassName(cls.name);
    setClassSubjectId(cls.subjectId);
    setClassGradeId(cls.gradeId);
    setClassSystemId(cls.systemId);
    setLessonPrice(cls.lessonPrice);
    setClassIsActive(cls.isActive);
    setClassNotes(cls.notes || '');
    setClassFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Class with Server-authoritative financial calculation
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    setClassFeedback(null);

    if (!isPriceValid) {
      setClassFeedback({
        type: 'error',
        message: `Lesson price (${lessonPrice} EGP) must be at least equal to Center Share (${centerShare} EGP).`,
      });
      return;
    }

    const res = saveClass({
      id: selectedClassId || undefined,
      name: className,
      teacherId: classTeacherId,
      subjectId: classSubjectId,
      gradeId: classGradeId,
      systemId: classSystemId,
      lessonPrice,
      isActive: classIsActive,
      notes: classNotes,
    });

    if (res.success) {
      setClassFeedback({ type: 'success', message: res.message });
      if (res.classEntity) {
        setSelectedClassId(res.classEntity.id);
      }
    } else {
      setClassFeedback({ type: 'error', message: res.message });
    }
  };

  // Filtered teachers for search dropdown
  const filteredTeachers = useMemo(() => {
    if (!teacherSearchQuery) return teachers;
    const q = teacherSearchQuery.toLowerCase();
    return teachers.filter((t) => t.name.toLowerCase().includes(q) || t.phone.includes(q) || t.code.toLowerCase().includes(q));
  }, [teachers, teacherSearchQuery]);

  // Filtered classes for the bottom table
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      if (filterSubject !== 'ALL' && cls.subjectId !== filterSubject) return false;
      if (filterGrade !== 'ALL' && cls.gradeId !== filterGrade) return false;
      if (filterSystem !== 'ALL' && cls.systemId !== filterSystem) return false;
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        const matchName = cls.name.toLowerCase().includes(q);
        const matchTeacher = (cls.teacherName || '').toLowerCase().includes(q);
        const matchSubject = (cls.subjectName || '').toLowerCase().includes(q);
        return matchName || matchTeacher || matchSubject;
      }
      return true;
    });
  }, [classes, filterSubject, filterGrade, filterSystem, tableSearch]);

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.teacherClass.title}
        subtitle={t.teacherClass.subtitle}
        icon={GraduationCap}
        badge="Master-Detail"
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: t.nav.teachersClasses },
        ]}
      />

      {/* TOP DUAL-CARD GRID (Phase 1 & Phase 2 Core Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT CARD: TEACHER INFORMATION */}
        <SectionCard
          title={t.teacherClass.teacherCardTitle}
          subtitle={t.teacherClass.teacherCardSubtitle}
          badge={selectedTeacherId ? `ID: T${String(selectedTeacherId).padStart(5, '0')}` : 'New Record'}
          icon={<Users className="w-5 h-5 text-cyan-600" />}
          headerAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewTeacher}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.teacherClass.newTeacher}</span>
              </button>
            </div>
          }
        >
          {/* Search/Load Teacher Bar */}
          <div className="mb-4 pb-4 border-b border-slate-100">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              {t.common.search} {t.teacherClass.teacherName}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              <input
                type="text"
                placeholder={t.teacherClass.searchPlaceholder}
                value={teacherSearchQuery}
                onChange={(e) => setTeacherSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
            {teacherSearchQuery && (
              <div className="mt-1 max-h-32 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-md divide-y divide-slate-100 text-xs">
                {filteredTeachers.map((tch) => (
                  <button
                    key={tch.id}
                    type="button"
                    onClick={() => {
                      handleSelectTeacher(tch);
                      setTeacherSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-start hover:bg-cyan-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">{tch.name}</span>
                    <span className="text-[11px] text-slate-400">{tch.phone} ({tch.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveTeacher} className="space-y-4">
            {teacherFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  teacherFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {teacherFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{teacherFeedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.teacherName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Karim Mostafa"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.phone} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.email}
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@60center.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.hireDate}
                </label>
                <input
                  type="date"
                  value={teacherHireDate}
                  onChange={(e) => setTeacherHireDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.teacherClass.address}
              </label>
              <input
                type="text"
                value={teacherAddress}
                onChange={(e) => setTeacherAddress(e.target.value)}
                placeholder="District, City"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.teacherClass.notes}
              </label>
              <textarea
                rows={2}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Specializations, degrees, academic background..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teacherIsActive}
                  onChange={(e) => setTeacherIsActive(e.target.checked)}
                  className="rounded-sm text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span>{t.teacherClass.status}: <strong className={teacherIsActive ? 'text-emerald-600' : 'text-slate-400'}>{teacherIsActive ? t.common.active : t.common.inactive}</strong></span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewTeacher}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline me-1" />
                  {t.common.reset}
                </button>
                <button
                  type="submit"
                  disabled={!hasPermission('TEACHER_CREATE') && !hasPermission('TEACHER_EDIT')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.teacherClass.saveTeacher}</span>
                </button>
              </div>
            </div>
          </form>
        </SectionCard>

        {/* RIGHT CARD: CLASS CONFIGURATION & FINANCIAL RATES */}
        <SectionCard
          title={t.teacherClass.classCardTitle}
          subtitle={t.teacherClass.classCardSubtitle}
          badge={selectedClassId ? `Class ID: #${selectedClassId}` : 'New Class'}
          icon={<Layers className="w-5 h-5 text-cyan-600" />}
          headerAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewClass}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.teacherClass.newClass}</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveClass} className="space-y-4">
            {classFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  classFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {classFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{classFeedback.message}</span>
              </div>
            )}

            {/* Teacher Select Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.teacherClass.teacherName} <span className="text-rose-500">*</span>
              </label>
              <select
                value={classTeacherId}
                onChange={(e) => setClassTeacherId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              >
                {teachers
                  .filter((t) => t.isActive)
                  .map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.name} ({tch.code})
                    </option>
                  ))}
              </select>
            </div>

            {/* Class Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.teacherClass.className} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Physics - Grade 12 (IG)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            {/* Subject, Grade, System Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.subject}
                </label>
                <select
                  value={classSubjectId}
                  onChange={(e) => setClassSubjectId(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isRtl ? s.nameAr : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.grade}
                </label>
                <select
                  value={classGradeId}
                  onChange={(e) => setClassGradeId(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {isRtl ? g.nameAr : g.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.educationSystem}
                </label>
                <select
                  value={classSystemId}
                  onChange={(e) => handleSystemChange(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-semibold text-cyan-900"
                >
                  {educationSystems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {isRtl ? sys.nameAr : sys.nameEn} ({sys.currentCenterShare} EGP)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FINANCIAL RULE BREAKDOWN CONTAINER (Section 10 Requirement) */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                  <Calculator className="w-4 h-4" />
                  <span>Financial Split Engine</span>
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded-sm">
                  {t.teacherClass.priceFormulaNote}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {/* 1. Student Lesson Price (Editable) */}
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                    {t.teacherClass.lessonPrice} (EGP)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={lessonPrice}
                    onChange={(e) => setLessonPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full text-center bg-slate-950 border border-cyan-500/40 rounded-md py-1 text-base font-bold text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <span className="text-[10px] text-cyan-400/80 mt-1 block">Editable Input</span>
                </div>

                {/* 2. Center Share (Read-Only from System Rate) */}
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>{t.teacherClass.centerShare}</span>
                  </div>
                  <div className="text-base font-bold text-slate-300 font-mono py-1">
                    {centerShare.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{t.common.readOnly}</span>
                </div>

                {/* 3. Teacher Share (Auto-Calculated Read-Only) */}
                <div className="bg-cyan-950/60 p-2.5 rounded-lg border border-cyan-700/50">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-300 mb-1">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    <span>{t.teacherClass.teacherShare}</span>
                  </div>
                  <div className="text-base font-extrabold text-cyan-400 font-mono py-1">
                    {teacherShare.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">{t.common.calculated}</span>
                </div>
              </div>

              {!isPriceValid && (
                <div className="text-rose-400 text-xs flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Lesson price cannot be less than configured center share ({centerShare} EGP).</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classIsActive}
                  onChange={(e) => setClassIsActive(e.target.checked)}
                  className="rounded-sm text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span>Class Active Status: <strong className={classIsActive ? 'text-emerald-600' : 'text-slate-400'}>{classIsActive ? t.common.active : t.common.inactive}</strong></span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewClass}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline me-1" />
                  {t.common.reset}
                </button>
                <button
                  type="submit"
                  disabled={!isPriceValid || (!hasPermission('CLASS_CREATE') && !hasPermission('CLASS_EDIT'))}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.teacherClass.saveClass}</span>
                </button>
              </div>
            </div>
          </form>
        </SectionCard>
      </div>

      {/* BOTTOM DATA TABLE: ACTIVE CLASSES & TEACHERS REGISTRY */}
      <SectionCard
        title={t.teacherClass.tableTitle}
        subtitle="Live registry of all configured academic groups with realtime revenue splits and teacher allocations"
        badge={`${filteredClasses.length} Classes`}
        icon={<GraduationCap className="w-5 h-5 text-slate-700" />}
      >
        {/* Table Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
            <input
              type="text"
              placeholder="Search class or teacher..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {isRtl ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Grades</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {isRtl ? g.nameAr : g.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Systems</option>
              {educationSystems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {isRtl ? sys.nameAr : sys.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-900 text-slate-200 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-start">Teacher / Instructor</th>
                <th className="px-4 py-3 text-start">Class Name</th>
                <th className="px-4 py-3 text-start">Subject & Grade</th>
                <th className="px-4 py-3 text-start">System</th>
                <th className="px-4 py-3 text-end">Lesson Price</th>
                <th className="px-4 py-3 text-end">Teacher Share</th>
                <th className="px-4 py-3 text-end">Center Share</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    {t.teacherClass.noClasses}
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedClassId === cls.id ? 'bg-cyan-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{cls.teacherName}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{cls.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 me-1">
                        {isRtl ? cls.subjectNameAr : cls.subjectName}
                      </span>
                      <span className="text-slate-500">{isRtl ? cls.gradeNameAr : cls.gradeName}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-cyan-900">
                      {isRtl ? cls.systemNameAr : cls.systemName}
                    </td>
                    <td className="px-4 py-3 text-end font-mono font-bold text-slate-900">
                      {cls.lessonPrice.toFixed(2)} {t.common.egp}
                    </td>
                    <td className="px-4 py-3 text-end font-mono font-bold text-cyan-700 bg-cyan-50/30">
                      {cls.teacherShare.toFixed(2)} {t.common.egp}
                    </td>
                    <td className="px-4 py-3 text-end font-mono font-medium text-slate-600">
                      {cls.centerShare.toFixed(2)} {t.common.egp}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          cls.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {cls.isActive ? t.common.active : t.common.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectClass(cls)}
                          title="Edit Class"
                          className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deactivateClass(cls.id)}
                          title={cls.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            cls.isActive
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {cls.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};
