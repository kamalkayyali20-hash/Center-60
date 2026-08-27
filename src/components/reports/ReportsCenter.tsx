import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  DollarSign,
  Award,
  Users,
  Layers,
  CheckCircle,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';

export const ReportsCenter: React.FC = () => {
  const {
    t,
    isRtl,
    teachers,
    classes,
    students,
    sessions,
    payments,
    expenses,
    settlements,
    educationSystems,
  } = useApp();

  const [activeReport, setActiveReport] = useState<'dailyCash' | 'teacherSettlement' | 'masterSchedule' | 'attendanceSummary'>('dailyCash');

  const handlePrint = () => {
    window.print();
  };

  const totalGross = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalCenter = payments.reduce((sum, p) => sum + p.centerShare, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalCenter - totalExpenses;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.reports.title}
        subtitle={t.reports.subtitle}
        icon={FileText}
        badge="Official Audit Printouts"
        actions={
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.common.print} Official Report</span>
          </button>
        }
        breadcrumbs={[
          { label: '60 Center' },
          { label: t.nav.reportsCenter },
        ]}
      />

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px print:hidden">
        <button
          onClick={() => setActiveReport('dailyCash')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeReport === 'dailyCash'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t.reports.reports.dailyCash}</span>
        </button>

        <button
          onClick={() => setActiveReport('teacherSettlement')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeReport === 'teacherSettlement'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t.reports.reports.teacherSettlement}</span>
        </button>

        <button
          onClick={() => setActiveReport('masterSchedule')}
          className={`px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeReport === 'masterSchedule'
              ? 'border-cyan-600 text-cyan-900 bg-cyan-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.reports.reports.schedule}</span>
        </button>
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8" id="official-report-body">
        {/* Official Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 font-extrabold text-xl flex items-center justify-center">
              60
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">60 EDUCATION CENTER</h1>
              <p className="text-xs text-slate-500 font-medium">Enterprise Resource Planning • Financial & Operational Audits</p>
            </div>
          </div>
          <div className="text-right rtl:text-left text-xs">
            <div className="font-bold text-slate-900 uppercase">
              {activeReport === 'dailyCash' && t.reports.reports.dailyCash}
              {activeReport === 'teacherSettlement' && t.reports.reports.teacherSettlement}
              {activeReport === 'masterSchedule' && t.reports.reports.schedule}
            </div>
            <div className="text-slate-500 mt-0.5">Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* 1. DAILY CASH RECONCILIATION */}
        {activeReport === 'dailyCash' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Total Gross Inflow:</span>
                <span className="font-bold text-sm text-slate-900">{totalGross.toFixed(2)} EGP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Center Retained Revenue:</span>
                <span className="font-bold text-sm text-cyan-800">{totalCenter.toFixed(2)} EGP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Operational Overhead:</span>
                <span className="font-bold text-sm text-rose-600">-{totalExpenses.toFixed(2)} EGP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Net Center Profit:</span>
                <span className="font-extrabold text-sm text-emerald-700">{netProfit.toFixed(2)} EGP</span>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-slate-200 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-start">Receipt #</th>
                  <th className="px-3 py-2 text-start">Student</th>
                  <th className="px-3 py-2 text-start">Class</th>
                  <th className="px-3 py-2 text-end">Gross Fee</th>
                  <th className="px-3 py-2 text-end">Teacher Share</th>
                  <th className="px-3 py-2 text-end">Center Share</th>
                  <th className="px-3 py-2 text-start">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-bold text-cyan-800">{p.receiptNumber}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{p.studentName}</td>
                    <td className="px-3 py-2 text-slate-700">{p.className}</td>
                    <td className="px-3 py-2 text-end font-mono font-bold">{p.amountPaid.toFixed(2)}</td>
                    <td className="px-3 py-2 text-end font-mono text-cyan-700">{p.teacherShare.toFixed(2)}</td>
                    <td className="px-3 py-2 text-end font-mono text-emerald-700 font-semibold">{p.centerShare.toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-600">{p.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TEACHER SETTLEMENT RECONCILIATION */}
        {activeReport === 'teacherSettlement' && (
          <div className="space-y-6 text-xs">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-slate-200 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-start">Voucher #</th>
                  <th className="px-3 py-2 text-start">Teacher</th>
                  <th className="px-3 py-2 text-start">Date</th>
                  <th className="px-3 py-2 text-center">Sessions</th>
                  <th className="px-3 py-2 text-center">Students</th>
                  <th className="px-3 py-2 text-end">Gross Revenue</th>
                  <th className="px-3 py-2 text-end">Center Share</th>
                  <th className="px-3 py-2 text-end">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-bold text-cyan-800">{s.settlementCode}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{s.teacherName}</td>
                    <td className="px-3 py-2 text-slate-600">{s.settlementDate}</td>
                    <td className="px-3 py-2 text-center">{s.totalSessions}</td>
                    <td className="px-3 py-2 text-center">{s.totalStudentsAttended}</td>
                    <td className="px-3 py-2 text-end font-mono">{s.grossRevenue.toFixed(2)}</td>
                    <td className="px-3 py-2 text-end font-mono text-slate-600">{s.centerShareTotal.toFixed(2)}</td>
                    <td className="px-3 py-2 text-end font-mono font-bold text-emerald-700">{s.netPayout.toFixed(2)} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. MASTER SCHEDULE REPORT */}
        {activeReport === 'masterSchedule' && (
          <div className="space-y-6 text-xs">
            <table className="w-full text-xs">
              <thead className="bg-slate-900 text-slate-200 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-start">Date</th>
                  <th className="px-3 py-2 text-start">Time Slot</th>
                  <th className="px-3 py-2 text-start">Class Name</th>
                  <th className="px-3 py-2 text-start">Instructor</th>
                  <th className="px-3 py-2 text-start">Room</th>
                  <th className="px-3 py-2 text-end">Lesson Fee</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono">{sess.sessionDate}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{sess.startTime} - {sess.endTime}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{sess.className}</td>
                    <td className="px-3 py-2 text-cyan-900 font-semibold">{sess.teacherName}</td>
                    <td className="px-3 py-2 text-slate-600">{sess.roomName}</td>
                    <td className="px-3 py-2 text-end font-mono font-bold">{sess.lessonPrice} EGP</td>
                    <td className="px-3 py-2 text-center font-semibold">{sess.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Sign-off block */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-200 text-xs">
          <div>
            <p className="text-slate-500 mb-6">Prepared by Finance Officer</p>
            <div className="border-t border-slate-300 pt-1 font-semibold text-slate-700">Accounting Department</div>
          </div>
          <div className="text-right rtl:text-left">
            <p className="text-slate-500 mb-6">Approved by Center Managing Director</p>
            <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">Dr. CEO / Academic Supervisor</div>
          </div>
        </div>
      </div>
    </div>
  );
};
