import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { StudentPayment } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReceiptModalProps {
  payment: StudentPayment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { isRtl, t } = useApp();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header toolbar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">{t.reception.receiptTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
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

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 bg-white font-mono text-slate-800" id="printable-receipt">
          {/* Center Brand Header */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 font-bold text-lg mb-2 shadow-xs">
              60
            </div>
            <h2 className="font-bold text-lg tracking-wider text-slate-900 uppercase">60 EDUCATION CENTER</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Premier Academic Excellence & Exam Preparation</p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-sm">
              {t.reception.receiptNo}: {payment.receiptNumber}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">{t.reception.receiptTime}:</span>
              <span className="font-bold">{payment.paymentDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">{t.reception.student}:</span>
              <span className="font-bold text-slate-900">{payment.studentName} ({payment.studentCode})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">{t.reception.class}:</span>
              <span className="font-bold text-slate-900">{payment.className}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">{t.reception.teacher}:</span>
              <span className="font-bold text-slate-900">{payment.teacherName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">{t.reception.paymentMethod}:</span>
              <span className="font-semibold text-cyan-800">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">{t.reception.cashier}:</span>
              <span className="text-slate-700">{payment.receivedBy}</span>
            </div>
          </div>

          {/* Total & Paid Stamp */}
          <div className="mt-5 pt-3 border-t-2 border-slate-900 flex items-center justify-between">
            <span className="font-bold text-sm font-sans uppercase tracking-wider text-slate-900">{t.common.total} {t.common.paid}:</span>
            <span className="font-extrabold text-xl text-slate-900 font-mono">
              {payment.amountPaid.toFixed(2)} {t.common.egp}
            </span>
          </div>

          {/* Verification Badge & Stamp */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.reception.paidStamp}</span>
            </div>
            <span className="font-sans text-[10px] text-slate-400">Authorized Center Stamp</span>
          </div>

          <div className="text-center mt-4 text-[10px] text-slate-400 font-sans">
            Thank you for learning with 60 Education Center. Keep this receipt for session verification.
          </div>
        </div>

        {/* Footer (Hidden during print) */}
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
