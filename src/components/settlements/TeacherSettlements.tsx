import React, { useState, useMemo } from 'react';
import {
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  Calendar,
  Calculator,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, TeacherSettlement } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';
import { VoucherModal } from '../common/VoucherModal';

export const TeacherSettlements: React.FC = () => {
  const {
    t,
    isRtl,
    teachers,
    sessions,
    payments,
    settlements,
    processTeacherSettlement,
    hasPermission,
  } = useApp();

  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(1); // Default to Karim Mostafa
  const [deductions, setDeductions] = useState<number>(0);
  const [deductionNotes, setDeductionNotes] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('CASH');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Voucher Modal
  const [activeVoucher, setActiveVoucher] = useState<TeacherSettlement | null>(null);

  const selectedTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  }, [teachers, selectedTeacherId]);

  // Unsettled sessions for this teacher
  const unsettledSessions = useMemo(() => {
    return sessions.filter((s) => s.teacherId === selectedTeacherId && !s.isSettled);
  }, [sessions, selectedTeacherId]);

  const unsettledSessionIds = useMemo(() => {
    return unsettledSessions.map((s) => s.id);
  }, [unsettledSessions]);

  // Payments for these unsettled sessions
  const unsettledPayments = useMemo(() => {
    return payments.filter((p) => unsettledSessionIds.includes(p.sessionId) && !p.isCancelled);
  }, [payments, unsettledSessionIds]);

  // Settlement Calculation
  const totalStudents = unsettledPayments.length;
  const grossRevenue = unsettledPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const centerShareTotal = unsettledPayments.reduce((sum, p) => sum + p.centerShare, 0);
  const teacherEarningsTotal = unsettledPayments.reduce((sum, p) => sum + p.teacherShare, 0);
  const netPayout = Math.max(0, teacherEarningsTotal - (deductions || 0));

  const handleProcessSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (unsettledSessions.length === 0) {
      setFeedback({ type: 'error', message: 'No completed sessions to settle for this teacher.' });
      return;
    }

    const res = processTeacherSettlement({
      teacherId: selectedTeacherId,
      sessionIds: unsettledSessionIds,
      deductions,
      deductionNotes,
      paymentMethod: payoutMethod,
      notes: settlementNotes,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (res.settlement) {
        setActiveVoucher(res.settlement);
      }
      setDeductions(0);
      setDeductionNotes('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.settlements.title}
        subtitle={t.settlements.subtitle}
        icon={Award}
        badge="Finance & Accounts"
        breadcrumbs={[
          { label: '60 Center' },
          { label: t.nav.teacherSettlements },
        ]}
      />

      {/* SELECT TEACHER BAR */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{t.settlements.selectTeacher}</h3>
            <p className="text-xs text-slate-400">Calculate earnings for completed academic sessions</p>
          </div>
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedTeacherId}
            onChange={(e) => {
              setSelectedTeacherId(Number(e.target.value));
              setFeedback(null);
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-cyan-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
          >
            {teachers.map((tch) => (
              <option key={tch.id} value={tch.id}>
                {tch.name} ({tch.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SETTLEMENT ENGINE & DISBURSEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLUMNS: UNSETTLED SESSIONS & SUMMARY */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title={`${t.settlements.unsettledSessions} (${selectedTeacher?.name})`}
            subtitle="Completed sessions with confirmed student attendance awaiting payout"
            badge={`${unsettledSessions.length} Sessions`}
            icon={<Calendar className="w-5 h-5 text-cyan-600" />}
          >
            {feedback && (
              <div
                className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            {unsettledSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-sm">{t.settlements.allSettled}</p>
                <p className="text-xs text-slate-500 mt-1">No pending payouts required for this instructor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-900 text-slate-200 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5 text-start">Class Name</th>
                        <th className="px-4 py-2.5 text-start">Session Date & Time</th>
                        <th className="px-4 py-2.5 text-start">Room</th>
                        <th className="px-4 py-2.5 text-end">Price / St.</th>
                        <th className="px-4 py-2.5 text-end">Teacher Share</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {unsettledSessions.map((sess) => (
                        <tr key={sess.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{sess.className}</td>
                          <td className="px-4 py-2.5 text-slate-700">
                            {sess.sessionDate} • {sess.startTime} - {sess.endTime}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{sess.roomName}</td>
                          <td className="px-4 py-2.5 text-end font-mono font-medium">{sess.lessonPrice} EGP</td>
                          <td className="px-4 py-2.5 text-end font-mono font-bold text-cyan-800">
                            {sess.teacherShare} EGP
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Unsettled
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Confirmed Attending Students in this batch */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    Attending Students in this batch ({unsettledPayments.length} Paid Attendances):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unsettledPayments.map((p) => (
                      <span
                        key={p.id}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-700 font-medium flex items-center gap-1 shadow-2xs"
                      >
                        <span className="font-bold text-slate-900">{p.studentName}</span>
                        <span className="text-[10px] text-slate-400">({p.studentCode})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT COLUMN: CALCULATION SUMMARY & DISBURSEMENT */}
        <div className="space-y-6">
          <SectionCard
            title="Settlement Financial Split"
            subtitle="Automated ledger reconciliation"
            icon={<Calculator className="w-5 h-5 text-cyan-600" />}
          >
            <form onSubmit={handleProcessSettlement} className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                  <span>{t.settlements.studentsCount}:</span>
                  <span className="text-base font-bold text-white font-mono">{totalStudents}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>{t.settlements.grossRevenue}:</span>
                  <span className="font-mono font-semibold">{grossRevenue.toFixed(2)} EGP</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>{t.settlements.centerPortion}:</span>
                  <span className="font-mono font-medium text-slate-400">-{centerShareTotal.toFixed(2)} EGP</span>
                </div>

                <div className="flex justify-between items-center text-cyan-300 font-semibold pt-1 border-t border-slate-800">
                  <span>{t.settlements.teacherPortion}:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {teacherEarningsTotal.toFixed(2)} EGP
                  </span>
                </div>
              </div>

              {/* Deductions Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.settlements.deductions} (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={deductions}
                    onChange={(e) => setDeductions(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="INSTAPAY">InstaPay</option>
                    <option value="VODAFONE_CASH">Vodafone Cash</option>
                  </select>
                </div>
              </div>

              {deductions > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Deduction</label>
                  <input
                    type="text"
                    value={deductionNotes}
                    onChange={(e) => setDeductionNotes(e.target.value)}
                    placeholder="e.g. Printing materials / photocopies"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              {/* NET PAYOUT HIGHLIGHT */}
              <div className="p-4 bg-emerald-950 text-white rounded-xl border border-emerald-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-200">
                  {t.settlements.netPayout}:
                </span>
                <span className="font-extrabold text-xl text-emerald-400 font-mono">
                  {netPayout.toFixed(2)} {t.common.egp}
                </span>
              </div>

              <button
                type="submit"
                disabled={unsettledSessions.length === 0 || (!hasPermission('SETTLEMENT_CREATE'))}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                <span>{t.settlements.processSettlementBtn}</span>
              </button>
            </form>
          </SectionCard>
        </div>
      </div>

      {/* HISTORICAL SETTLEMENT VOUCHERS REGISTRY */}
      <SectionCard
        title={t.settlements.historyTitle}
        subtitle="Audited record of all disbursed teacher settlement vouchers and payment receipts"
        badge={`${settlements.length} Vouchers`}
        icon={<FileText className="w-5 h-5 text-slate-700" />}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-900 text-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3 text-start">Voucher Code</th>
                <th className="px-4 py-3 text-start">Teacher</th>
                <th className="px-4 py-3 text-start">Settlement Date</th>
                <th className="px-4 py-3 text-center">Sessions</th>
                <th className="px-4 py-3 text-center">Students</th>
                <th className="px-4 py-3 text-end">Gross Rev.</th>
                <th className="px-4 py-3 text-end">Net Payout</th>
                <th className="px-4 py-3 text-start">Auditor</th>
                <th className="px-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {settlements.map((stl) => (
                <tr key={stl.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-800">{stl.settlementCode}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{stl.teacherName}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{stl.settlementDate}</td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">{stl.totalSessions}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">{stl.totalStudentsAttended}</td>
                  <td className="px-4 py-3 text-end font-mono font-medium text-slate-600">
                    {stl.grossRevenue.toFixed(2)} EGP
                  </td>
                  <td className="px-4 py-3 text-end font-mono font-extrabold text-emerald-700 bg-emerald-50/40">
                    {stl.netPayout.toFixed(2)} EGP
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{stl.processedBy}</td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => setActiveVoucher(stl)}
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

      {/* Official Printable Voucher Modal */}
      <VoucherModal settlement={activeVoucher} onClose={() => setActiveVoucher(null)} />
    </div>
  );
};
