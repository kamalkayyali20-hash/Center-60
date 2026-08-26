import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  GraduationCap,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { AppPageHeader } from '../common/AppPageHeader';
import { MetricCard } from '../common/MetricCard';
import { SectionCard } from '../common/SectionCard';

export const CeoDashboard: React.FC = () => {
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
    setCurrentView,
  } = useApp();

  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Core Financial Aggregations
  const totalGrossRevenue = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amountPaid, 0);
  }, [payments]);

  const totalCenterShare = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.centerShare, 0);
  }, [payments]);

  const totalTeacherShare = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.teacherShare, 0);
  }, [payments]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netCenterProfit = totalCenterShare - totalExpenses;
  const netMarginPercent = totalGrossRevenue > 0 ? ((netCenterProfit / totalGrossRevenue) * 100).toFixed(1) : '0.0';

  // System Revenue Breakdown for Pie Chart
  const systemChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    educationSystems.forEach((sys) => {
      dataMap[sys.nameEn] = 0;
    });

    payments.forEach((p) => {
      const cls = classes.find((c) => c.id === p.classId);
      const sysName = cls?.systemName || 'National Egyptian';
      dataMap[sysName] = (dataMap[sysName] || 0) + p.amountPaid;
    });

    const colors = ['#0891b2', '#0284c7', '#3b82f6', '#6366f1'];
    return Object.keys(dataMap).map((key, i) => ({
      name: key,
      value: dataMap[key],
      color: colors[i % colors.length],
    }));
  }, [educationSystems, payments, classes]);

  // Teacher Revenue Breakdown for Bar Chart
  const teacherPerformanceData = useMemo(() => {
    const dataMap: Record<string, { gross: number; teacher: number; center: number }> = {};

    teachers.forEach((t) => {
      dataMap[t.name] = { gross: 0, teacher: 0, center: 0 };
    });

    payments.forEach((p) => {
      if (dataMap[p.teacherName]) {
        dataMap[p.teacherName].gross += p.amountPaid;
        dataMap[p.teacherName].teacher += p.teacherShare;
        dataMap[p.teacherName].center += p.centerShare;
      }
    });

    return Object.keys(dataMap).map((name) => ({
      name: name.split(' ')[0], // First name for chart readability
      fullName: name,
      gross: dataMap[name].gross,
      teacherShare: dataMap[name].teacher,
      centerShare: dataMap[name].center,
    }));
  }, [teachers, payments]);

  // Daily Flow Trend Data (Demonstrative)
  const dailyFlowData = [
    { day: 'Mon', revenue: 1400, centerProfit: 450, expenses: 100 },
    { day: 'Tue', revenue: 2100, centerProfit: 650, expenses: 300 },
    { day: 'Wed', revenue: 1850, centerProfit: 550, expenses: 200 },
    { day: 'Thu', revenue: 3200, centerProfit: 1050, expenses: 400 },
    { day: 'Fri', revenue: 4500, centerProfit: 1450, expenses: 600 },
    { day: 'Sat', revenue: 3900, centerProfit: 1200, expenses: 350 },
    { day: 'Sun', revenue: totalGrossRevenue, centerProfit: netCenterProfit, expenses: totalExpenses },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Page Header */}
      <AppPageHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        icon={TrendingUp}
        badge="Live Analytics"
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center gap-1 shadow-2xs">
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeFilter === 'today' ? 'bg-slate-900 text-cyan-400' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeFilter === 'week' ? 'bg-slate-900 text-cyan-400' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeFilter === 'month' ? 'bg-slate-900 text-cyan-400' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeFilter === 'all' ? 'bg-slate-900 text-cyan-400' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All-Time
              </button>
            </div>
          </div>
        }
        breadcrumbs={[
          { label: '60 Center ERP' },
          { label: t.nav.dashboard },
        ]}
      />

      {/* TOP EXECUTIVE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <MetricCard
          title={t.dashboard.grossRevenue}
          value={`${totalGrossRevenue.toLocaleString()} EGP`}
          subtitle="Total student session fees collected"
          icon={DollarSign}
          variant="navy"
          trend={{ value: '+18.4%', isPositive: true }}
          onClick={() => setCurrentView('receptionDesk')}
        />

        {/* Center Net Profit */}
        <MetricCard
          title={t.dashboard.netCenterProfit}
          value={`${netCenterProfit.toLocaleString()} EGP`}
          subtitle={`Center Retention Margin: ${netMarginPercent}%`}
          icon={TrendingUp}
          variant="cyan"
          trend={{ value: '+24.1%', isPositive: true }}
        />

        {/* Teacher Payouts */}
        <MetricCard
          title={t.dashboard.teacherPayouts}
          value={`${totalTeacherShare.toLocaleString()} EGP`}
          subtitle="Instructor session fee shares"
          icon={Award}
          variant="emerald"
          onClick={() => setCurrentView('teacherSettlements')}
        />

        {/* Center Expenses */}
        <MetricCard
          title={t.dashboard.centerExpenses}
          value={`${totalExpenses.toLocaleString()} EGP`}
          subtitle="Facility & operational costs"
          icon={DollarSign}
          variant="slate"
          onClick={() => setCurrentView('expensesManager')}
        />
      </div>

      {/* SECOND ROW: QUICK OPERATIONAL STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">{t.dashboard.activeStudents}</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{students.length} Registered</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">{t.dashboard.activeTeachers}</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{teachers.length} Instructors</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">Configured Classes</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{classes.length} Groups</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block font-medium">Scheduled Sessions</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{sessions.length} Sessions</span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CHART 1: REVENUE TREND (AREA CHART) */}
        <div className="lg:col-span-2">
          <SectionCard
            title={t.dashboard.revenueTrend}
            subtitle="Real-time cashflow distribution: Gross Fees vs. Center Retained Margin"
            icon={<BarChart3 className="w-5 h-5 text-cyan-600" />}
          >
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyFlowData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" EGP" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#0891b2" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="centerProfit" name="Center Retention" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMargin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* CHART 2: SYSTEM REVENUE SHARE (PIE CHART) */}
        <div className="lg:col-span-1">
          <SectionCard
            title={t.dashboard.systemBreakdown}
            subtitle="Volume share by curriculum"
            icon={<PieIcon className="w-5 h-5 text-cyan-600" />}
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={systemChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {systemChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* CHART 3: TEACHER PERFORMANCE RANKING */}
      <SectionCard
        title={t.dashboard.teacherRankings}
        subtitle="Revenue generated by instructor showing gross student intake vs. center share retention"
        icon={<Award className="w-5 h-5 text-slate-700" />}
      >
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teacherPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit=" EGP" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="gross" name="Total Gross Intake" fill="#0f172a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="teacherShare" name="Teacher Share" fill="#0891b2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="centerShare" name="Center Share" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
};
