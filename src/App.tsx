import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TeacherClassManager } from './components/teachers-classes/TeacherClassManager';
import { SystemSetup } from './components/setup/SystemSetup';
import { PayAndAttendDesk } from './components/reception/PayAndAttendDesk';
import { TeacherSettlements } from './components/settlements/TeacherSettlements';
import { StudentEnrollmentManager } from './components/students/StudentEnrollmentManager';
import { ScheduleSessionManager } from './components/schedule/ScheduleSessionManager';
import { ExpenseManager } from './components/expenses/ExpenseManager';
import { CeoDashboard } from './components/dashboard/CeoDashboard';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { AuditTrailViewer } from './components/audit/AuditTrailViewer';

const AppContent: React.FC = () => {
  const { currentView, isRtl } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'teacherClass':
        return <TeacherClassManager />;
      case 'systemSetup':
        return <SystemSetup />;
      case 'receptionDesk':
        return <PayAndAttendDesk />;
      case 'teacherSettlements':
        return <TeacherSettlements />;
      case 'studentsEnrollment':
        return <StudentEnrollmentManager />;
      case 'classSchedules':
        return <ScheduleSessionManager />;
      case 'expensesManager':
        return <ExpenseManager />;
      case 'dashboard':
        return <CeoDashboard />;
      case 'reportsCenter':
        return <ReportsCenter />;
      case 'auditTrail':
        return <AuditTrailViewer />;
      default:
        return <TeacherClassManager />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content Body Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all ${
            isRtl ? 'lg:mr-64' : 'lg:ml-64'
          }`}
        >
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
