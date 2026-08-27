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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, ClassEntity } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';

export const StudentEnrollmentManager: React.FC = () => {
  const {
    t,
    isRtl,
    students,
    classes,
    enrollments,
    grades,
    saveStudent,
    enrollStudent,
    hasPermission,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0]);

  // Add/Edit Student Modal
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');
  const [gradeId, setGradeId] = useState<number>(5); // Grade 12
  const [notes, setNotes] = useState('');
  const [studentFeedback, setStudentFeedback] = useState<string | null>(null);

  // Enroll in Class State
  const [selectedClassToEnroll, setSelectedClassToEnroll] = useState<number>(1);
  const [enrollFeedback, setEnrollFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.phone.includes(q)
    );
  }, [students, searchQuery]);

  // Current student's active enrollments
  const studentEnrollments = useMemo(() => {
    if (!selectedStudent) return [];
    return enrollments.filter((e) => e.studentId === selectedStudent.id && e.isActive);
  }, [enrollments, selectedStudent]);

  const handleOpenNewStudent = () => {
    setEditingStudentId(null);
    setName('');
    setPhone('');
    setGuardianName('');
    setGuardianPhone('');
    setAddress('');
    setSchool('');
    setGradeId(5);
    setNotes('');
    setStudentFeedback(null);
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveStudent({
      id: editingStudentId || undefined,
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
      setStudentFeedback(res.message);
      if (res.student) {
        setSelectedStudent(res.student);
      }
      setTimeout(() => {
        setStudentModalOpen(false);
      }, 1000);
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
        title={t.students.title}
        subtitle={t.students.subtitle}
        icon={Users}
        badge="Directory & Registrations"
        actions={
          <button
            type="button"
            disabled={!hasPermission('STUDENT_CREATE')}
            onClick={handleOpenNewStudent}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.students.addStudent}</span>
          </button>
        }
        breadcrumbs={[
          { label: '60 Center' },
          { label: t.nav.studentsEnrollment },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: STUDENTS SEARCH & LIST */}
        <div className="lg:col-span-1 space-y-4">
          <SectionCard title="Student Directory" badge={`${filteredStudents.length} Records`}>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              <input
                type="text"
                placeholder={t.students.searchStudents}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-2 pe-1 divide-y divide-slate-100">
              {filteredStudents.map((std) => (
                <button
                  key={std.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(std);
                    setEnrollFeedback(null);
                  }}
                  className={`w-full p-3 text-start rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    selectedStudent?.id === std.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'hover:bg-slate-100/80 text-slate-900 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${
                        selectedStudent?.id === std.id
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {((std.name || 'ST').substring(0, 2)).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs">{std.name}</div>
                      <div className={`text-[11px] ${selectedStudent?.id === std.id ? 'text-slate-400' : 'text-slate-500'}`}>
                        {std.phone} • {std.gradeName}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-sm font-bold ${
                      selectedStudent?.id === std.id
                        ? 'bg-slate-800 text-cyan-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {std.code}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT 2 COLUMNS: STUDENT DETAILS & CLASS ENROLLMENTS */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <>
              {/* Profile Card */}
              <SectionCard
                title={`Student Profile: ${selectedStudent.name}`}
                badge={selectedStudent.code}
                icon={<GraduationCap className="w-5 h-5 text-cyan-600" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">{t.students.fullName}:</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">Student Mobile:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedStudent.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">{t.students.grade}:</span>
                    <span className="font-bold text-cyan-900">{selectedStudent.gradeName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">{t.students.guardianName}:</span>
                    <span className="font-bold text-slate-900">{selectedStudent.guardianName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">{t.students.guardianPhone}:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedStudent.guardianPhone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-1 font-medium">{t.students.school}:</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.school || '—'}</span>
                  </div>
                </div>

                {selectedStudent.notes && (
                  <div className="mt-3 p-3 bg-cyan-50/40 rounded-lg border border-cyan-100 text-xs text-slate-700">
                    <strong className="text-cyan-900">Administrative Notes:</strong> {selectedStudent.notes}
                  </div>
                )}
              </SectionCard>

              {/* Class Enrollments & Enroll Action */}
              <SectionCard
                title={t.students.enrollments}
                subtitle="Classes currently registered for this student"
                badge={`${studentEnrollments.length} Active`}
                icon={<BookOpen className="w-5 h-5 text-slate-700" />}
              >
                {/* Enroll in new class form */}
                <form onSubmit={handleEnrollStudent} className="p-4 bg-slate-900 text-white rounded-xl mb-5 space-y-3">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {t.students.enrollStudent}
                  </div>

                  {enrollFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        enrollFeedback.type === 'success'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {enrollFeedback.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{enrollFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={selectedClassToEnroll}
                      onChange={(e) => setSelectedClassToEnroll(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                    >
                      {classes
                        .filter((c) => c.isActive)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.teacherName} ({c.lessonPrice} EGP)
                          </option>
                        ))}
                    </select>

                    <button
                      type="submit"
                      disabled={!hasPermission('ENROLLMENT_MANAGE')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      {t.students.enrollStudent}
                    </button>
                  </div>
                </form>

                {/* Enrollments Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-900 text-slate-200 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5 text-start">Enrolled Class</th>
                        <th className="px-4 py-2.5 text-start">Teacher</th>
                        <th className="px-4 py-2.5 text-start">Enrollment Date</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {studentEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                            Student is not currently enrolled in any class groups. Use the form above to register.
                          </td>
                        </tr>
                      ) : (
                        studentEnrollments.map((enr) => (
                          <tr key={enr.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-900">{enr.className}</td>
                            <td className="px-4 py-2.5 text-cyan-900 font-semibold">{enr.teacherName}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-mono">{enr.enrollmentDate}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
              Select a student from the directory on the left.
            </div>
          )}
        </div>
      </div>

      {/* NEW STUDENT MODAL */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">{t.students.addStudent}</h3>
              </div>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
              {studentFeedback && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{studentFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.students.fullName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Youssef Hisham"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Mobile <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.students.guardianName}
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Guardian Full Name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.students.guardianPhone}
                  </label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="011XXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.students.grade}
                  </label>
                  <select
                    value={gradeId}
                    onChange={(e) => setGradeId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    {t.students.school}
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Modern Academy"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.teacherClass.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Area / District"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Register Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
