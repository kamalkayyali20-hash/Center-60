import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  UserCheck,
  Search,
  CheckCircle,
  AlertCircle,
  Receipt,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, AttendanceStatus, StudentPayment } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { ReceiptModal } from '../common/ReceiptModal';

export const PayAndAttendDesk: React.FC = () => {
  const {
    t,
    isRtl,
    students,
    sessions,
    payments,
    attendance,
    processPayAndAttend,
    hasPermission,
  } = useApp();

  // Reception Form State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(1); // Default to Adam Khaled
  const [selectedSessionId, setSelectedSessionId] = useState<number>(1);         // Default to Session 1
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('PRESENT');
  const [deskFeedback, setDeskFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<StudentPayment | null>(null);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const selectedSession = useMemo(() => {
    return sessions.find((sess) => sess.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  // Check if student already attended
  const alreadyAttended = useMemo(() => {
    if (!selectedStudentId || !selectedSessionId) return false;
    return attendance.some((a) => a.sessionId === selectedSessionId && a.studentId === selectedStudentId);
  }, [attendance, selectedStudentId, selectedSessionId]);

  // Filtered Students Search
  const searchResults = useMemo(() => {
    if (!studentSearch.trim()) return [];
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.phone.includes(q)
    );
  }, [students, studentSearch]);

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
    setStudentSearch('');
    setDeskFeedback(null);
  };

  const handlePayAndAttend = (e: React.FormEvent) => {
    e.preventDefault();
    setDeskFeedback(null);

    if (!selectedStudentId) {
      setDeskFeedback({ type: 'error', message: 'Please select a student.' });
      return;
    }
    if (!selectedSession) {
      setDeskFeedback({ type: 'error', message: 'Please select an active session.' });
      return;
    }

    const res = processPayAndAttend({
      studentId: selectedStudentId,
      sessionId: selectedSession.id,
      amountPaid: selectedSession.lessonPrice,
      paymentMethod,
      attendanceStatus,
    });

    if (res.success) {
      setDeskFeedback({ type: 'success', message: res.message });
      if (res.payment) {
        setActiveReceipt(res.payment);
      }
    } else {
      setDeskFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.reception.title}
        subtitle={t.reception.subtitle}
        icon={CreditCard}
        badge="Reception High-Speed Desk"
        breadcrumbs={[
          { label: '60 Center' },
          { label: t.nav.receptionDesk },
        ]}
      />

      {/* RECEPTION WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT & CENTER 2 COLUMNS: DESK INTERFACE */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Fast Student Check-In & Financial Processing"
            subtitle="Search student, choose session, collect fee, and issue instant verified receipt"
            icon={<UserCheck className="w-5 h-5 text-cyan-600" />}
          >
            {deskFeedback && (
              <div
                className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  deskFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {deskFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{deskFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePayAndAttend} className="space-y-5">
              {/* Step 1: Student Lookup */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  1. Search & Select Student <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={t.reception.searchStudentPrompt}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 text-xs">
                    {searchResults.map((std) => (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => handleSelectStudent(std.id)}
                        className="w-full px-3 py-2.5 text-start hover:bg-cyan-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{std.name}</span>
                          <span className="text-slate-500 block text-[11px]">{std.school} ({std.gradeName})</span>
                        </div>
                        <span className="font-mono font-bold text-cyan-800 bg-cyan-100/60 px-2 py-0.5 rounded-sm">
                          {std.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Student Card */}
                {selectedStudent && (
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-cyan-400 font-bold flex items-center justify-center text-xs">
                        {((selectedStudent.name || 'ST').substring(0, 2)).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{selectedStudent.name}</div>
                        <div className="text-xs text-slate-500">
                          {selectedStudent.code} • Phone: {selectedStudent.phone} • {selectedStudent.gradeName}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Verified Student
                    </span>
                  </div>
                )}
              </div>

              {/* Step 2: Choose Session */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. {t.reception.selectSession} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {sessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      {sess.className} — {sess.teacherName} ({sess.sessionDate} • {sess.startTime} - {sess.endTime} in {sess.roomName}) — Fee: {sess.lessonPrice} EGP
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Payment Method & Attendance Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    3. {t.reception.paymentMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="CASH">{t.reception.methods.CASH}</option>
                    <option value="INSTAPAY">{t.reception.methods.INSTAPAY}</option>
                    <option value="VODAFONE_CASH">{t.reception.methods.VODAFONE_CASH}</option>
                    <option value="CREDIT_CARD">{t.reception.methods.CREDIT_CARD}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    4. {t.reception.attendanceStatus}
                  </label>
                  <select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="PRESENT">{t.reception.statuses.PRESENT}</option>
                    <option value="LATE">{t.reception.statuses.LATE}</option>
                    <option value="EXCUSED">{t.reception.statuses.EXCUSED}</option>
                  </select>
                </div>
              </div>

              {/* Already Attended Warning */}
              {alreadyAttended && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t.reception.alreadyAttended}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={alreadyAttended || !selectedStudentId || (!hasPermission('PAYMENT_CREATE'))}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>{t.reception.payAndAttendBtn}</span>
              </button>
            </form>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN: FINANCIAL BREAKDOWN CARD */}
        <div className="space-y-6">
          <SectionCard
            title={t.reception.financialSummary}
            subtitle="Automated transaction snapshot"
            icon={<ShieldCheck className="w-5 h-5 text-cyan-600" />}
          >
            {selectedSession && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                    <span>{t.reception.lessonPrice}:</span>
                    <span className="text-xl font-bold text-white font-mono">
                      {selectedSession.lessonPrice.toFixed(2)} {t.common.egp}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>{t.reception.centerShare}:</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {selectedSession.centerShare.toFixed(2)} {t.common.egp}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-cyan-300 font-semibold">
                    <span>{t.reception.teacherShare}:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {selectedSession.teacherShare.toFixed(2)} {t.common.egp}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Transaction Guarantee:</div>
                  <p className="text-[11px] leading-relaxed">
                    Executing this payment atomically writes the student receipt and registers session attendance in one unified database transaction.
                  </p>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* TODAY'S RECEPTION PAYMENT LOG TABLE */}
      <SectionCard
        title="Today's Reception Transactions & Attendance Log"
        subtitle="Realtime stream of student check-ins and payments collected at the reception counter"
        badge={`${payments.length} Payments`}
        icon={<Receipt className="w-5 h-5 text-slate-700" />}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-900 text-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3 text-start">Receipt #</th>
                <th className="px-4 py-3 text-start">Student Name</th>
                <th className="px-4 py-3 text-start">Class & Teacher</th>
                <th className="px-4 py-3 text-end">Amount Paid</th>
                <th className="px-4 py-3 text-center">Payment Method</th>
                <th className="px-4 py-3 text-start">Time</th>
                <th className="px-4 py-3 text-start">Cashier</th>
                <th className="px-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-800">{p.receiptNumber}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {p.studentName} <span className="text-slate-400 font-normal">({p.studentCode})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <span className="font-medium">{p.className}</span>
                    <span className="block text-[11px] text-slate-400">{p.teacherName}</span>
                  </td>
                  <td className="px-4 py-3 text-end font-mono font-bold text-slate-900">
                    {p.amountPaid.toFixed(2)} {t.common.egp}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{p.paymentDate}</td>
                  <td className="px-4 py-3 text-slate-600">{p.receivedBy}</td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => setActiveReceipt(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs flex items-center gap-1 cursor-pointer transition-colors ms-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.common.print}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Printable Receipt Modal Popup */}
      <ReceiptModal payment={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
};
