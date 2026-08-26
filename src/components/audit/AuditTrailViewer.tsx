import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  Clock,
  Filter,
  User,
  Database,
  Code,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppPageHeader } from '../common/AppPageHeader';
import { SectionCard } from '../common/SectionCard';

export const AuditTrailViewer: React.FC = () => {
  const {
    t,
    isRtl,
    auditLogs,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedEntity !== 'ALL' && log.entityType !== selectedEntity) return false;
      if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchDesc = log.description.toLowerCase().includes(q);
        const matchUser = log.userName.toLowerCase().includes(q);
        const matchEntity = log.entityType.toLowerCase().includes(q);
        return matchDesc || matchUser || matchEntity;
      }
      return true;
    });
  }, [auditLogs, selectedEntity, selectedAction, search]);

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={t.audit.title}
        subtitle={t.audit.subtitle}
        icon={ShieldAlert}
        badge="Immutable Security Log"
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: t.nav.auditTrail },
        ]}
      />

      <SectionCard
        title="Enterprise Transaction Audit Log"
        subtitle="Full immutable ledger of system actions, financial commitments, and configuration adjustments"
        badge={`${filteredLogs.length} Events`}
        icon={<Database className="w-5 h-5 text-slate-700" />}
      >
        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
            <input
              type="text"
              placeholder={t.audit.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Entity Domains</option>
              <option value="CLASS">Classes & Groups</option>
              <option value="TEACHER">Teachers</option>
              <option value="EDUCATION_SYSTEM_RATE">Financial Rates</option>
              <option value="PAYMENT">Student Payments</option>
              <option value="TEACHER_SETTLEMENT">Teacher Settlements</option>
              <option value="EXPENSE">Center Expenses</option>
              <option value="SESSION">Class Sessions</option>
            </select>
          </div>

          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Action Types</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="RATE_ADJUSTMENT">RATE_ADJUSTMENT</option>
              <option value="PAY_AND_ATTEND">PAY_AND_ATTEND</option>
              <option value="SETTLE">SETTLE</option>
              <option value="ENROLL">ENROLL</option>
              <option value="DEACTIVATE">DEACTIVATE</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-start">
            <thead className="bg-slate-900 text-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3 text-start">Timestamp</th>
                <th className="px-4 py-3 text-start">Operator / User</th>
                <th className="px-4 py-3 text-center">Action</th>
                <th className="px-4 py-3 text-start">Target Entity</th>
                <th className="px-4 py-3 text-start">Description & Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          log.action === 'CREATE' || log.action === 'PAY_AND_ATTEND'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'RATE_ADJUSTMENT'
                            ? 'bg-amber-100 text-amber-800'
                            : log.action === 'SETTLE'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-900 font-semibold">
                      {log.entityType} #{log.entityId}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium">{log.description}</div>
                      {(log.oldValues || log.newValues) && (
                        <div className="mt-1 text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-sm border border-slate-200">
                          {log.oldValues && <span className="text-rose-700">OLD: {JSON.stringify(log.oldValues)} </span>}
                          {log.newValues && <span className="text-emerald-700">NEW: {JSON.stringify(log.newValues)}</span>}
                        </div>
                      )}
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
