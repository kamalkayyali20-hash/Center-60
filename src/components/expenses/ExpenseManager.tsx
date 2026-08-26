import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Receipt,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  TrendingDown,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';

export const ExpenseManager: React.FC = () => {
  const {
    t,
    isRtl,
    expenses,
    recordExpense,
    hasPermission,
  } = useApp();

  const [category, setCategory] = useState<ExpenseCategory>('ELECTRICITY');
  const [amount, setAmount] = useState<number>(1200);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [recipientVendor, setRecipientVendor] = useState('Cairo North Electricity Distribution Co.');
  const [description, setDescription] = useState('Monthly central electricity consumption invoice');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, categoryFilter]);

  const totalExpenseSum = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = recordExpense({
      category,
      amount,
      expenseDate,
      paymentMethod,
      recipientVendor,
      description,
      notes,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setDescription('');
      setRecipientVendor('');
      setNotes('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.expenses.title}
        subtitle={t.expenses.subtitle}
        icon={DollarSign}
        badge="Operating Overhead"
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: t.nav.expensesManager },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: RECORD EXPENSE VOUCHER */}
        <div className="lg:col-span-1 space-y-4">
          <SectionCard
            title={t.expenses.recordExpense}
            subtitle="Register operational cost with automatic double-entry journal"
            icon={<Receipt className="w-5 h-5 text-cyan-600" />}
          >
            <form onSubmit={handleRecordExpense} className="space-y-4">
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
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
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expenses.category} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ELECTRICITY">{t.expenses.categories.ELECTRICITY}</option>
                  <option value="INTERNET">{t.expenses.categories.INTERNET}</option>
                  <option value="WATER">{t.expenses.categories.WATER}</option>
                  <option value="RENT">{t.expenses.categories.RENT}</option>
                  <option value="PRINTING_SUPPLIES">{t.expenses.categories.PRINTING_SUPPLIES}</option>
                  <option value="MAINTENANCE">{t.expenses.categories.MAINTENANCE}</option>
                  <option value="STAFF_SALARY">{t.expenses.categories.STAFF_SALARY}</option>
                  <option value="MISCELLANEOUS">{t.expenses.categories.MISCELLANEOUS}</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expenses.amount} (EGP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="5"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.expenses.date}</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="CASH">Cash Drawer</option>
                    <option value="INSTAPAY">InstaPay</option>
                    <option value="CREDIT_CARD">Corporate Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expenses.vendor} / Recipient
                </label>
                <input
                  type="text"
                  required
                  value={recipientVendor}
                  onChange={(e) => setRecipientVendor(e.target.value)}
                  placeholder="e.g. Telecom Egypt (WE)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of expense"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={!hasPermission('EXPENSE_CREATE')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Post Expense Voucher</span>
              </button>
            </form>
          </SectionCard>
        </div>

        {/* RIGHT 2 COLUMNS: EXPENSE REGISTRY & VOUCHERS */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard
            title={t.expenses.historyTitle}
            subtitle="Audited ledger of center disbursements and overhead operational costs"
            badge={`${filteredExpenses.length} Records • Total: ${totalExpenseSum.toFixed(2)} EGP`}
            icon={<FileSpreadsheet className="w-5 h-5 text-slate-700" />}
          >
            {/* Filter */}
            <div className="mb-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="INTERNET">Internet</option>
                <option value="WATER">Water</option>
                <option value="RENT">Rent</option>
                <option value="PRINTING_SUPPLIES">Printing Supplies</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="STAFF_SALARY">Staff Salary</option>
                <option value="MISCELLANEOUS">Miscellaneous</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-900 text-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-start">Voucher #</th>
                    <th className="px-4 py-3 text-start">Category</th>
                    <th className="px-4 py-3 text-start">Vendor & Description</th>
                    <th className="px-4 py-3 text-start">Date</th>
                    <th className="px-4 py-3 text-end">Amount</th>
                    <th className="px-4 py-3 text-start">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-800">{exp.voucherNumber}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {t.expenses.categories[exp.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{exp.recipientVendor}</div>
                        <div className="text-[11px] text-slate-500">{exp.description}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{exp.expenseDate}</td>
                      <td className="px-4 py-3 text-end font-mono font-bold text-rose-600">
                        -{exp.amount.toFixed(2)} EGP
                      </td>
                      <td className="px-4 py-3 text-slate-500">{exp.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
