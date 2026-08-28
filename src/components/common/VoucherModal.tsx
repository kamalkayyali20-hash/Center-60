import React from 'react';
import { Printer, X, Award, CheckCircle2 } from 'lucide-react';
import { TeacherSettlement } from '../../types';
import { useApp } from '../../context/AppContext';

interface VoucherModalProps {
  settlement: TeacherSettlement | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ settlement, onClose }) => {
  const { t } = useApp();

  if (!settlement) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Toolbar */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Award className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
            <span className="font-semibold text-xs sm:text-sm">{t.settlements.printVoucher}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.common.print}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Printable Voucher Document */}
        <div className="p-4 sm:p-8 bg-white text-slate-900 text-sm" id="printable-voucher">
          {/* Official Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-extrabold text-xl shadow-xs">
                60
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">60 EDUCATION CENTER</h1>
                <p className="text-xs text-slate-500 font-medium">Finance & Accounting Administration • إدارة الحسابات</p>
              </div>
            </div>
            <div className="text-right rtl:text-left">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md border border-emerald-300">
                OFFICIAL DISBURSEMENT VOUCHER
              </span>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                {t.settlements.voucherNo}: {settlement.settlementCode}
              </div>
            </div>
          </div>

          {/* Teacher & Settlement Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">{t.teacherClass.teacherName}:</span>
              <span className="font-bold text-base text-slate-900">{settlement.teacherName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">{t.settlements.voucherDate}:</span>
              <span className="font-semibold text-slate-800">{settlement.settlementDate}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">{t.settlements.sessionsCount}:</span>
              <span className="font-bold text-slate-800">{settlement.totalSessions} Sessions</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">{t.settlements.studentsCount}:</span>
              <span className="font-bold text-slate-800">{settlement.totalStudentsAttended} Students Attended</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 text-left rtl:text-right">Financial Component</th>
                  <th className="px-4 py-2.5 text-right rtl:text-left">Amount (EGP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 text-slate-600">Total Gross Student Fees Collected</td>
                  <td className="px-4 py-2.5 text-right rtl:text-left font-mono font-medium">{settlement.grossRevenue.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-slate-600">Center Administrative & Facility Retention</td>
                  <td className="px-4 py-2.5 text-right rtl:text-left font-mono font-medium text-slate-500">-{settlement.centerShareTotal.toFixed(2)}</td>
                </tr>
                <tr className="bg-cyan-50/40">
                  <td className="px-4 py-2.5 font-semibold text-slate-900">Teacher Gross Session Earnings</td>
                  <td className="px-4 py-2.5 text-right rtl:text-left font-mono font-bold text-cyan-900">{settlement.teacherEarningsTotal.toFixed(2)}</td>
                </tr>
                {settlement.deductions > 0 && (
                  <tr className="text-rose-600">
                    <td className="px-4 py-2.5">Deductions ({settlement.deductionNotes || 'Administrative adjustment'})</td>
                    <td className="px-4 py-2.5 text-right rtl:text-left font-mono font-bold">-{settlement.deductions.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td className="px-4 py-3 uppercase tracking-wider">{t.settlements.netPayout}:</td>
                  <td className="px-4 py-3 text-right rtl:text-left font-mono text-cyan-400 text-base">
                    {settlement.netPayout.toFixed(2)} {t.common.egp}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment & Audit Info */}
          <div className="text-xs text-slate-500 space-y-1 mb-8">
            <div className="flex justify-between">
              <span>Disbursement Method: <strong>{settlement.paymentMethod}</strong></span>
              <span>Processed By: <strong>{settlement.processedBy}</strong></span>
            </div>
            {settlement.notes && <div>Administrative Notes: {settlement.notes}</div>}
          </div>

          {/* Signatures Section */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-200 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-8">Prepared By (Accountant)</p>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Accounting Dept</div>
            </div>
            <div>
              <p className="text-slate-500 mb-8">Approved By (CEO / Manager)</p>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Management Approval</div>
            </div>
            <div>
              <p className="text-slate-500 mb-8">Teacher Signature & Acceptance</p>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">{settlement.teacherName}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
