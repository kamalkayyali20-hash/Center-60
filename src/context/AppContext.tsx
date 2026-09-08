import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Language,
  User,
  UserRole,
  Permission,
  Subject,
  Grade,
  EducationSystem,
  Room,
  Teacher,
  ClassEntity,
  Student,
  Enrollment,
  ScheduleSlot,
  ClassSession,
  SessionStatus,
  NavView,
  AttendanceRecord,
  StudentPayment,
  TeacherSettlement,
  ExpenseRecord,
  AuditLog,
  PaymentMethod,
  AttendanceStatus,
  SessionFile,
  TeacherTimeoutConfig,
  CardCustomizationConfig,
  ManagerDueConfig,
  UserInvitation,
  ClassAcceptanceMode,
  ClassScheduleDay,
  EnrollmentFeeConfig,
  TeacherClassRequest,
  CrossCenterTeacherBooking,
} from '../types';
import {
  initialUsers,
  initialSubjects,
  initialGrades,
  initialEducationSystems,
  initialRooms,
  initialTeachers,
  initialClasses,
  initialStudents,
  initialEnrollments,
  initialScheduleSlots,
  initialSessions,
  initialAttendance,
  initialPayments,
  initialSettlements,
  initialExpenses,
  initialAuditLogs,
  initialTeacherTimeoutConfig,
  initialCardCustomizationConfig,
  initialManagerDueConfig,
  initialInvitations,
  initialEnrollmentFeeConfig,
  initialTeacherClassRequests,
  crossCenterTeacherBookings,
  globalStudentsRegistry,
  globalTeachersRegistry,
} from '../data/initialData';
import {
  normalizeEgyptianPhone,
  checkStudentDuplicate,
  checkTeacherDuplicate,
  validateRoomConflict,
  validateTeacherConflict,
  validateStudentScheduleConflict,
  validateClassScheduleSlotRoomConflict,
  validateClassScheduleSlotTeacherConflict,
  validateStudentClassEnrollmentScheduleConflict,
  validateClassCapacity,
  validateTeacherAcademicEligibility,
  validatePriceSplit,
} from '../utils/validation';
import { getT } from '../i18n/translations';

// Simple UUID generator
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface AppContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: ReturnType<typeof getT>;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  selectedSessionId: number | null;
  setSelectedSessionId: (id: number | null) => void;
  navigateToSessionDetail: (sessionId: number) => void;

  // Data states
  users: User[];
  subjects: Subject[];
  grades: Grade[];
  educationSystems: EducationSystem[];
  rooms: Room[];
  teachers: Teacher[];
  classes: ClassEntity[];
  students: Student[];
  enrollments: Enrollment[];
  scheduleSlots: ScheduleSlot[];
  sessions: ClassSession[];
  attendance: AttendanceRecord[];
  payments: StudentPayment[];
  settlements: TeacherSettlement[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLog[];
  invitations: UserInvitation[];
  teacherClassRequests: TeacherClassRequest[];
  crossCenterBookings: CrossCenterTeacherBooking[];
  globalStudents: Student[];
  globalTeachers: Teacher[];

  // Configurations
  teacherTimeoutConfig: TeacherTimeoutConfig;
  setTeacherTimeoutConfig: (cfg: TeacherTimeoutConfig) => void;
  cardCustomizationConfig: CardCustomizationConfig;
  setCardCustomizationConfig: (cfg: CardCustomizationConfig) => void;
  managerDueConfig: ManagerDueConfig;
  setManagerDueConfig: (cfg: ManagerDueConfig) => void;
  enrollmentFeeConfig: EnrollmentFeeConfig;
  setEnrollmentFeeConfig: (cfg: EnrollmentFeeConfig) => void;

  // Entity Actions
  saveTeacher: (teacherData: Partial<Teacher>) => { success: boolean; message: string; teacher?: Teacher; foundTeacher?: Teacher };
  deactivateTeacher: (teacherId: number) => { success: boolean; message: string };
  deleteTeacher: (teacherId: number) => { success: boolean; message: string };
  connectGlobalTeacherToCenter: (teacherId: number) => { success: boolean; message: string; teacher?: Teacher };

  saveClass: (classData: {
    id?: number;
    name: string;
    teacherId: number;
    subjectId: number;
    gradeId: number;
    systemId: number;
    lessonPrice: number;
    maxCapacity?: number;
    educationalType?: string;
    scheduleDays?: ClassScheduleDay[];
    acceptanceMode?: ClassAcceptanceMode;
    isActive?: boolean;
    notes?: string;
  }) => { success: boolean; message: string; classEntity?: ClassEntity; request?: TeacherClassRequest };
  deactivateClass: (classId: number) => { success: boolean; message: string };
  deleteClass: (classId: number) => { success: boolean; message: string };
  approveClassRequest: (requestId: number) => { success: boolean; message: string; classEntity?: ClassEntity };
  rejectClassRequest: (requestId: number, reason: string) => { success: boolean; message: string };

  saveStudent: (studentData: Partial<Student> & { initialClassId?: number }) => { success: boolean; message: string; student?: Student; foundStudent?: Student };
  deleteStudent: (studentId: number) => { success: boolean; message: string };
  promoteStudentGrades: (studentIds?: number[] | 'ALL') => { success: boolean; message: string; count: number };
  enrollStudent: (studentId: number, classId: number, isOneTime?: boolean) => { success: boolean; message: string };
  unenrollStudent: (enrollmentId: number) => { success: boolean; message: string };
  connectGlobalStudentToCenter: (studentId: number) => { success: boolean; message: string; student?: Student };
  collectEnrollmentFee: (studentId: number, amount?: number, paymentMethod?: PaymentMethod) => { success: boolean; message: string };

  saveScheduleSlot: (slotData: Partial<ScheduleSlot>) => { success: boolean; message: string };
  openSession: (classId: number, roomId: number, date: string, startTime: string, endTime: string) => { success: boolean; message: string; session?: ClassSession };
  createSession: (classId: number, roomId: number, date: string, startTime: string, endTime: string) => { success: boolean; message: string; session?: ClassSession };
  updateSessionStatus: (sessionId: number, status: SessionStatus) => { success: boolean; message: string };
  cancelSession: (sessionId: number, reason?: string) => { success: boolean; message: string };
  canTeacherEditSession: (session: ClassSession) => boolean;

  // Session Files
  addSessionFile: (sessionId: number, fileData: { name: string; size: string; type: string; url?: string }) => { success: boolean; message: string; file?: SessionFile };
  removeSessionFile: (sessionId: number, fileId: string) => { success: boolean; message: string };

  processPayAndAttend: (params: {
    studentId: number;
    sessionId: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    attendanceStatus: AttendanceStatus;
    receivedBy?: string;
  }) => { success: boolean; message: string; payment?: StudentPayment; receiptNumber?: string };

  processTeacherSettlement: (params: {
    teacherId: number;
    sessionIds: number[];
    deductions: number;
    deductionNotes?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => { success: boolean; message: string; settlement?: TeacherSettlement };

  saveExpense: (expenseData: Partial<ExpenseRecord>) => { success: boolean; message: string };
  recordExpense: (expenseData: Partial<ExpenseRecord>) => { success: boolean; message: string };

  // Setup Actions
  saveSubject: (subject: Partial<Subject>) => { success: boolean; message: string };
  saveGrade: (grade: Partial<Grade>) => { success: boolean; message: string };
  saveRoom: (room: Partial<Room>) => { success: boolean; message: string };
  updateEducationSystemRate: (systemId: number, newCenterShare: number, notes?: string) => { success: boolean; message: string };

  // Invitations & Phone Confirmation
  inviteUserWithRole: (email: string, role: UserRole) => { success: boolean; message: string; invitation?: UserInvitation };
  cancelInvitation: (invitationId: string) => { success: boolean; message: string };
  verifyPhoneNumber: (phone: string, otpCode: string) => { success: boolean; message: string };

  // Auth & Employee Management Actions
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authInitialMode: 'login' | 'register';
  setAuthInitialMode: (mode: 'login' | 'register') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  isAccountsControlModalOpen: boolean;
  setIsAccountsControlModalOpen: (open: boolean) => void;
  openAccountsControlModal: () => void;
  isUserLoggedIn: boolean;
  loginUser: (email: string, password?: string) => { success: boolean; message: string; user?: User };
  registerUser: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    role?: UserRole;
  }) => { success: boolean; message: string; user?: User };
  logoutUser: () => void;
  switchActiveAccount: (userId: number) => { success: boolean; message: string; user?: User };
  saveUser: (userData: Partial<User>) => { success: boolean; message: string; user?: User };
  deleteUser: (userId: number) => { success: boolean; message: string };
  deactivateUser: (userId: number) => { success: boolean; message: string };

  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = '60_education_center_erp_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('60_center_lang');
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  const [activeTab, setActiveTab] = useState<NavView>('teachersDashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default to Admin
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isAccountsControlModalOpen, setIsAccountsControlModalOpen] = useState(false);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const openAccountsControlModal = () => {
    setIsAccountsControlModalOpen(true);
  };

  const navigateToSessionDetail = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setActiveTab('sessionDetail');
  };

  // Load from local storage or fallback to pre-seeded initial data
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          users: parsed.users || initialUsers,
          subjects: parsed.subjects || initialSubjects,
          grades: parsed.grades || initialGrades,
          educationSystems: parsed.educationSystems || initialEducationSystems,
          rooms: parsed.rooms || initialRooms,
          teachers: parsed.teachers || initialTeachers,
          classes: parsed.classes || initialClasses,
          students: parsed.students || initialStudents,
          enrollments: parsed.enrollments || initialEnrollments,
          scheduleSlots: parsed.scheduleSlots || initialScheduleSlots,
          sessions: parsed.sessions || initialSessions,
          attendance: parsed.attendance || initialAttendance,
          payments: parsed.payments || initialPayments,
          settlements: parsed.settlements || initialSettlements,
          expenses: parsed.expenses || initialExpenses,
          auditLogs: parsed.auditLogs || initialAuditLogs,
          teacherTimeoutConfig: parsed.teacherTimeoutConfig || initialTeacherTimeoutConfig,
          cardCustomizationConfig: parsed.cardCustomizationConfig || initialCardCustomizationConfig,
          managerDueConfig: parsed.managerDueConfig || initialManagerDueConfig,
          invitations: parsed.invitations || initialInvitations,
          enrollmentFeeConfig: parsed.enrollmentFeeConfig || initialEnrollmentFeeConfig,
          teacherClassRequests: parsed.teacherClassRequests || initialTeacherClassRequests,
          crossCenterBookings: parsed.crossCenterBookings || crossCenterTeacherBookings,
          globalStudents: parsed.globalStudents || globalStudentsRegistry,
          globalTeachers: parsed.globalTeachers || globalTeachersRegistry,
        };
      } catch (e) {
        console.error('Failed to parse stored state, using defaults', e);
      }
    }
    return {
      users: initialUsers,
      subjects: initialSubjects,
      grades: initialGrades,
      educationSystems: initialEducationSystems,
      rooms: initialRooms,
      teachers: initialTeachers,
      classes: initialClasses,
      students: initialStudents,
      enrollments: initialEnrollments,
      scheduleSlots: initialScheduleSlots,
      sessions: initialSessions,
      attendance: initialAttendance,
      payments: initialPayments,
      settlements: initialSettlements,
      expenses: initialExpenses,
      auditLogs: initialAuditLogs,
      teacherTimeoutConfig: initialTeacherTimeoutConfig,
      cardCustomizationConfig: initialCardCustomizationConfig,
      managerDueConfig: initialManagerDueConfig,
      invitations: initialInvitations,
      enrollmentFeeConfig: initialEnrollmentFeeConfig,
      teacherClassRequests: initialTeacherClassRequests,
      crossCenterBookings: crossCenterTeacherBookings,
      globalStudents: globalStudentsRegistry,
      globalTeachers: globalTeachersRegistry,
    };
  });

  // Sync to local storage on modification
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to sync to local storage', e);
    }
  }, [data]);

  // Handle document direction on language switch
  useEffect(() => {
    const isRtl = language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('60_center_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const isRtl = language === 'ar';
  const t = useMemo(() => getT(language), [language]);

  const getPermissionsForRole = (role: UserRole): Permission[] => {
    switch (role) {
      case 'OWNER':
      case 'ADMIN':
      case 'CEO':
        return [
          'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT', 'TEACHER_DEACTIVATE', 'TEACHER_DELETE',
          'CLASS_VIEW', 'CLASS_CREATE', 'CLASS_EDIT', 'CLASS_DEACTIVATE',
          'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DELETE', 'STUDENT_GRADE_PROMOTE',
          'ENROLLMENT_MANAGE', 'SCHEDULE_VIEW', 'SCHEDULE_MANAGE', 'SESSION_MANAGE', 'ATTENDANCE_MARK',
          'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PAYMENT_CANCEL',
          'SETTLEMENT_VIEW', 'SETTLEMENT_CREATE', 'SETTLEMENT_APPROVE',
          'EXPENSE_MANAGE', 'SETUP_VIEW', 'SETUP_EDIT', 'FINANCIAL_CONFIG_EDIT',
          'USER_ADMIN', 'AUDIT_VIEW', 'REPORT_OPERATIONAL', 'REPORT_FINANCIAL', 'CEO_DASHBOARD'
        ];
      case 'MANAGER':
        return [
          'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT', 'TEACHER_DEACTIVATE', 'TEACHER_DELETE',
          'CLASS_VIEW', 'CLASS_CREATE', 'CLASS_EDIT', 'CLASS_DEACTIVATE',
          'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DELETE', 'STUDENT_GRADE_PROMOTE',
          'ENROLLMENT_MANAGE', 'SCHEDULE_VIEW', 'SCHEDULE_MANAGE', 'SESSION_MANAGE', 'ATTENDANCE_MARK',
          'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PAYMENT_CANCEL',
          'SETTLEMENT_VIEW', 'EXPENSE_MANAGE', 'SETUP_VIEW', 'REPORT_OPERATIONAL', 'REPORT_FINANCIAL'
        ];
      case 'ACCOUNTANT':
        return [
          'TEACHER_VIEW', 'CLASS_VIEW', 'STUDENT_VIEW', 'PAYMENT_VIEW', 'PAYMENT_CANCEL',
          'SETTLEMENT_VIEW', 'SETTLEMENT_CREATE', 'SETTLEMENT_APPROVE', 'EXPENSE_MANAGE',
          'REPORT_FINANCIAL', 'REPORT_OPERATIONAL'
        ];
      case 'RECEPTION':
        return [
          'TEACHER_VIEW', 'CLASS_VIEW', 'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT',
          'ENROLLMENT_MANAGE', 'SCHEDULE_VIEW', 'SESSION_MANAGE', 'ATTENDANCE_MARK',
          'PAYMENT_CREATE', 'PAYMENT_VIEW', 'REPORT_OPERATIONAL'
        ];
      case 'TEACHER':
        return [
          'TEACHER_VIEW', 'CLASS_VIEW', 'STUDENT_VIEW', 'SCHEDULE_VIEW', 'SESSION_MANAGE', 'REPORT_OPERATIONAL'
        ];
      case 'STUDENT':
        return ['STUDENT_VIEW', 'CLASS_VIEW', 'SCHEDULE_VIEW'];
      default:
        return ['STUDENT_VIEW', 'CLASS_VIEW', 'SCHEDULE_VIEW'];
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  const switchUserRole = (role: UserRole) => {
    const updatedUser: User = {
      ...currentUser,
      role,
      permissions: getPermissionsForRole(role),
    };
    setCurrentUser(updatedUser);
  };

  // Configurations Setters
  const setTeacherTimeoutConfig = (cfg: TeacherTimeoutConfig) => {
    setData((prev: any) => ({ ...prev, teacherTimeoutConfig: cfg }));
  };

  const setCardCustomizationConfig = (cfg: CardCustomizationConfig) => {
    setData((prev: any) => ({ ...prev, cardCustomizationConfig: cfg }));
  };

  const setManagerDueConfig = (cfg: ManagerDueConfig) => {
    setData((prev: any) => ({ ...prev, managerDueConfig: cfg }));
  };

  const setEnrollmentFeeConfig = (cfg: EnrollmentFeeConfig) => {
    setData((prev: any) => ({ ...prev, enrollmentFeeConfig: cfg }));
  };

  // Helper to add audit log
  const addAuditLog = (action: string, entityType: string, entityId: number | string, description: string, details?: string) => {
    const newLog: AuditLog = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId: String(entityId),
      description,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.50',
    };
    setData((prev: any) => ({
      ...prev,
      auditLogs: [newLog, ...(prev.auditLogs || [])],
    }));
  };

  // Check if teacher is within manager deadline to edit session
  const canTeacherEditSession = (session: ClassSession): boolean => {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'OWNER' || currentUser.role === 'MANAGER' || currentUser.role === 'RECEPTION') {
      return true;
    }
    if (currentUser.role !== 'TEACHER') return false;
    if (currentUser.teacherId && session.teacherId !== currentUser.teacherId) return false;

    // Check hours limit
    const deadlineHours = data.managerDueConfig?.teacherEditDeadlineHours || 24;
    const sessionDateTime = new Date(`${session.sessionDate}T${session.startTime || '00:00'}:00`);
    const now = new Date();
    const diffHours = (sessionDateTime.getTime() - now.getTime()) / (1000 * 3600);

    // If session is scheduled in the future or within deadlineHours
    return diffHours >= -deadlineHours;
  };

  // SAVE TEACHER (with phone normalization, local & global duplicate check, multi-grade/system support)
  const saveTeacher = (teacherData: Partial<Teacher>) => {
    const isEdit = Boolean(teacherData.id);
    const cleanPhone = normalizeEgyptianPhone(teacherData.phone || '');

    // Duplicate check on creation
    if (!isEdit && cleanPhone) {
      const dupCheck = checkTeacherDuplicate(
        cleanPhone,
        teacherData.email,
        data.teachers,
        data.globalTeachers,
        teacherData.id
      );

      if (dupCheck.outcome === 'CASE_C_LOCAL_EXISTS') {
        return {
          success: false,
          message: dupCheck.message || 'Teacher with this phone/email already registered in this center.',
          foundTeacher: dupCheck.foundTeacher,
        };
      }

      if (dupCheck.outcome === 'CASE_B_GLOBAL_EXISTS') {
        return {
          success: false,
          message: 'Teacher profile already exists in the KAYEDU Global Network. Connect them to this center instead of re-creating.',
          foundTeacher: dupCheck.foundTeacher,
        };
      }
    }

    let updatedTeacher: Teacher;
    const fName = teacherData.firstName || teacherData.name?.split(' ')[0] || 'Instructor';
    const lName = teacherData.lastName || teacherData.name?.split(' ').slice(1).join(' ') || '';
    const fullName = `${fName} ${lName}`.trim();

    if (isEdit && teacherData.id) {
      const existing = data.teachers.find((t: Teacher) => t.id === teacherData.id);
      if (!existing) return { success: false, message: 'Teacher not found.' };

      updatedTeacher = {
        ...existing,
        ...teacherData,
        phone: cleanPhone || existing.phone,
        firstName: fName,
        lastName: lName,
        name: fullName,
        gradeIds: teacherData.gradeIds || existing.gradeIds || [1, 2, 3, 4, 5],
        systemIds: teacherData.systemIds || existing.systemIds || [1, 2, 3],
        subjectIds: teacherData.subjectIds || existing.subjectIds || [1],
        autoApproveClasses: teacherData.autoApproveClasses ?? existing.autoApproveClasses ?? false,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      setData((prev: any) => ({
        ...prev,
        teachers: prev.teachers.map((t: Teacher) => (t.id === teacherData.id ? updatedTeacher : t)),
      }));

      addAuditLog('TEACHER_UPDATED', 'Teacher', updatedTeacher.id, `Updated teacher profile: ${updatedTeacher.name}`);
    } else {
      const newId = data.teachers.length > 0 ? Math.max(...data.teachers.map((t: Teacher) => t.id)) + 1 : 1;
      const code = `T${String(newId).padStart(5, '0')}`;

      updatedTeacher = {
        id: newId,
        code,
        firstName: fName,
        lastName: lName,
        name: fullName,
        phone: cleanPhone,
        altPhone: teacherData.altPhone ? normalizeEgyptianPhone(teacherData.altPhone) : '',
        email: teacherData.email || '',
        gender: teacherData.gender || 'MALE',
        address: teacherData.address || '',
        hireDate: teacherData.hireDate || new Date().toISOString().split('T')[0],
        notes: teacherData.notes || '',
        isActive: teacherData.isActive !== false,
        gradeIds: teacherData.gradeIds || [1, 2, 3, 4, 5],
        systemIds: teacherData.systemIds || [1, 2, 3],
        subjectIds: teacherData.subjectIds || [1],
        autoApproveClasses: teacherData.autoApproveClasses ?? false,
        isCenterConnected: true,
        lastSessionCompletedDate: new Date().toISOString().split('T')[0],
        assignedCenterIds: [1],
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      setData((prev: any) => ({
        ...prev,
        teachers: [updatedTeacher, ...prev.teachers],
      }));

      addAuditLog('TEACHER_CREATED', 'Teacher', updatedTeacher.id, `Created new teacher profile: ${updatedTeacher.name}`);
    }

    return {
      success: true,
      message: isEdit ? 'Teacher details successfully updated.' : 'New Teacher created successfully.',
      teacher: updatedTeacher,
    };
  };

  const connectGlobalTeacherToCenter = (teacherId: number) => {
    const globalT = (data.globalTeachers || []).find((t: Teacher) => t.id === teacherId);
    if (!globalT) return { success: false, message: 'Global teacher not found in registry.' };

    const alreadyInCenter = data.teachers.some((t: Teacher) => t.id === teacherId || t.phone === globalT.phone);
    if (alreadyInCenter) return { success: false, message: 'Teacher is already connected to this center.' };

    const connectedTeacher: Teacher = {
      ...globalT,
      isCenterConnected: true,
      assignedCenterIds: [...(globalT.assignedCenterIds || []), 1],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setData((prev: any) => ({
      ...prev,
      teachers: [connectedTeacher, ...prev.teachers],
    }));

    addAuditLog('TEACHER_CONNECTED', 'Teacher', connectedTeacher.id, `Connected KAYEDU teacher ${connectedTeacher.name} to 60 Education Center`);
    return { success: true, message: `Teacher ${connectedTeacher.name} connected to center.`, teacher: connectedTeacher };
  };

  const deactivateTeacher = (teacherId: number) => {
    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.map((t: Teacher) => (t.id === teacherId ? { ...t, isActive: !t.isActive } : t)),
    }));
    return { success: true, message: 'Teacher active status updated.' };
  };

  const deleteTeacher = (teacherId: number) => {
    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(currentUser.role)) {
      return { success: false, message: 'Only Center Managers and Admins can delete instructors.' };
    }

    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.filter((t: Teacher) => t.id !== teacherId),
      classes: prev.classes.filter((c: ClassEntity) => c.teacherId !== teacherId),
    }));

    return { success: true, message: 'Teacher profile and associated classes deleted.' };
  };

  // SAVE CLASS (with Price Split validation, Academic Eligibility, and Room/Teacher Conflict checks)
  const saveClass = (classData: {
    id?: number;
    name: string;
    teacherId: number;
    subjectId: number;
    gradeId: number;
    systemId: number;
    lessonPrice: number;
    maxCapacity?: number;
    educationalType?: string;
    scheduleDays?: ClassScheduleDay[];
    acceptanceMode?: ClassAcceptanceMode;
    isActive?: boolean;
    notes?: string;
  }) => {
    const teacher = data.teachers.find((t: Teacher) => t.id === classData.teacherId);
    const subject = data.subjects.find((s: Subject) => s.id === classData.subjectId);
    const grade = data.grades.find((g: Grade) => g.id === classData.gradeId);
    const system = data.educationSystems.find((sys: EducationSystem) => sys.id === classData.systemId);

    if (!teacher) return { success: false, message: 'Selected teacher not found.' };

    const centerShare = system ? system.currentCenterShare : 0;

    // 1. Validate Price Split Formula
    const priceValidation = validatePriceSplit(classData.lessonPrice, centerShare);
    if (!priceValidation.isValid) {
      return { success: false, message: priceValidation.message };
    }
    const teacherShare = priceValidation.teacherShare;

    // 2. Validate Academic Eligibility
    const academicEligibility = validateTeacherAcademicEligibility(teacher, classData.gradeId, classData.systemId);
    if (!academicEligibility.isEligible) {
      return { success: false, message: academicEligibility.message };
    }

    // 3. Validate Room & Teacher Schedule Conflicts for each schedule slot
    const scheduleDays = classData.scheduleDays || [{ dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '12:00', roomId: 1 }];
    for (const slot of scheduleDays) {
      const roomConflict = validateClassScheduleSlotRoomConflict(
        data.classes,
        slot.roomId || 1,
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        classData.id
      );
      if (roomConflict.hasConflict) {
        return { success: false, message: roomConflict.message };
      }

      const teacherConflict = validateClassScheduleSlotTeacherConflict(
        data.classes,
        data.crossCenterBookings || [],
        classData.teacherId,
        teacher.name,
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        classData.id
      );
      if (teacherConflict.hasConflict) {
        return { success: false, message: teacherConflict.message };
      }
    }

    // 4. Capacity Reduction Validation on Edit
    const maxCapacity = classData.maxCapacity || 40;
    if (classData.id) {
      const activeEnrollments = (data.enrollments || []).filter((e: Enrollment) => e.classId === classData.id && e.isActive).length;
      if (maxCapacity < activeEnrollments) {
        return {
          success: false,
          message: `Cannot reduce class capacity to ${maxCapacity}. There are currently ${activeEnrollments} active enrolled students.`,
        };
      }
    }

    // 5. Workflow: If created by a Teacher who does NOT have auto-approval and is not Admin/Manager
    const isTeacherUser = currentUser.role === 'TEACHER';
    const requiresCenterApproval = isTeacherUser && !teacher.autoApproveClasses && !classData.id;

    if (requiresCenterApproval) {
      const newReqId = (data.teacherClassRequests || []).length > 0
        ? Math.max(...data.teacherClassRequests.map((r: TeacherClassRequest) => r.id)) + 1
        : 1;

      const newRequest: TeacherClassRequest = {
        id: newReqId,
        teacherId: teacher.id,
        teacherName: teacher.name,
        className: classData.name,
        subjectId: classData.subjectId,
        subjectName: subject?.nameEn || 'Subject',
        gradeId: classData.gradeId,
        gradeName: grade?.nameEn || 'Grade',
        systemId: classData.systemId,
        systemName: system?.nameEn || 'System',
        lessonPrice: classData.lessonPrice,
        centerShare,
        teacherShare,
        roomId: scheduleDays[0]?.roomId || 1,
        roomName: data.rooms.find((r: Room) => r.id === (scheduleDays[0]?.roomId || 1))?.nameEn || 'Room 101',
        maxCapacity,
        scheduleDays,
        acceptanceMode: classData.acceptanceMode || 'OPEN',
        status: 'PENDING',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      setData((prev: any) => ({
        ...prev,
        teacherClassRequests: [newRequest, ...(prev.teacherClassRequests || [])],
      }));

      addAuditLog('CLASS_REQUEST_SUBMITTED', 'TeacherClassRequest', newRequest.id, `Teacher ${teacher.name} requested new class ${newRequest.className}`);

      return {
        success: true,
        message: 'Class proposal submitted for Center Manager approval.',
        request: newRequest,
      };
    }

    let updatedClass: ClassEntity;
    const isEdit = Boolean(classData.id);

    if (isEdit && classData.id) {
      const existing = data.classes.find((c: ClassEntity) => c.id === classData.id);
      if (!existing) return { success: false, message: 'Class not found.' };

      updatedClass = {
        ...existing,
        ...classData,
        teacherName: teacher?.name || existing.teacherName,
        subjectName: subject?.nameEn || existing.subjectName,
        subjectNameAr: subject?.nameAr || existing.subjectNameAr,
        gradeName: grade?.nameEn || existing.gradeName,
        gradeNameAr: grade?.nameAr || existing.gradeNameAr,
        systemName: system?.nameEn || existing.systemName,
        systemNameAr: system?.nameAr || existing.systemNameAr,
        lessonPrice: classData.lessonPrice,
        centerShare,
        teacherShare,
        maxCapacity,
        scheduleDays,
      };

      setData((prev: any) => ({
        ...prev,
        classes: prev.classes.map((c: ClassEntity) => (c.id === classData.id ? updatedClass : c)),
      }));

      addAuditLog('CLASS_UPDATED', 'Class', updatedClass.id, `Updated class ${updatedClass.name}`);
    } else {
      const newId = data.classes.length > 0 ? Math.max(...data.classes.map((c: ClassEntity) => c.id)) + 1 : 1;
      updatedClass = {
        id: newId,
        name: classData.name,
        teacherId: classData.teacherId,
        teacherName: teacher?.name || 'Instructor',
        subjectId: classData.subjectId,
        subjectName: subject?.nameEn || 'Subject',
        subjectNameAr: subject?.nameAr || 'المادة',
        gradeId: classData.gradeId,
        gradeName: grade?.nameEn || 'Grade',
        gradeNameAr: grade?.nameAr || 'الصف',
        systemId: classData.systemId,
        systemName: system?.nameEn || 'System',
        systemNameAr: system?.nameAr || 'النظام',
        lessonPrice: classData.lessonPrice,
        centerShare,
        teacherShare,
        maxCapacity,
        educationalType: classData.educationalType || 'Standard',
        scheduleDays,
        acceptanceMode: classData.acceptanceMode || 'OPEN',
        isActive: classData.isActive !== false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        notes: classData.notes || '',
      };

      setData((prev: any) => ({
        ...prev,
        classes: [updatedClass, ...prev.classes],
      }));

      addAuditLog('CLASS_CREATED', 'Class', updatedClass.id, `Created class ${updatedClass.name}`);
    }

    return {
      success: true,
      message: isEdit ? 'Class updated successfully.' : 'New Class added successfully.',
      classEntity: updatedClass,
    };
  };

  const approveClassRequest = (requestId: number) => {
    const request = (data.teacherClassRequests || []).find((r: TeacherClassRequest) => r.id === requestId);
    if (!request) return { success: false, message: 'Class request not found.' };

    const newId = data.classes.length > 0 ? Math.max(...data.classes.map((c: ClassEntity) => c.id)) + 1 : 1;
    const newClass: ClassEntity = {
      id: newId,
      name: request.className,
      teacherId: request.teacherId,
      teacherName: request.teacherName,
      subjectId: request.subjectId,
      subjectName: request.subjectName,
      subjectNameAr: request.subjectName,
      gradeId: request.gradeId,
      gradeName: request.gradeName,
      gradeNameAr: request.gradeName,
      systemId: request.systemId,
      systemName: request.systemName,
      systemNameAr: request.systemName,
      lessonPrice: request.lessonPrice,
      centerShare: request.centerShare,
      teacherShare: request.teacherShare,
      maxCapacity: request.maxCapacity,
      educationalType: 'Standard',
      scheduleDays: request.scheduleDays,
      acceptanceMode: request.acceptanceMode,
      isActive: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: `Approved from teacher request #${request.id}`,
    };

    setData((prev: any) => ({
      ...prev,
      classes: [newClass, ...prev.classes],
      teacherClassRequests: prev.teacherClassRequests.map((r: TeacherClassRequest) =>
        r.id === requestId ? { ...r, status: 'APPROVED' } : r
      ),
    }));

    addAuditLog('CLASS_REQUEST_APPROVED', 'TeacherClassRequest', requestId, `Approved class request for ${request.className}`);

    return { success: true, message: `Class request approved. "${newClass.name}" is now live.`, classEntity: newClass };
  };

  const rejectClassRequest = (requestId: number, reason: string) => {
    setData((prev: any) => ({
      ...prev,
      teacherClassRequests: (prev.teacherClassRequests || []).map((r: TeacherClassRequest) =>
        r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r
      ),
    }));

    addAuditLog('CLASS_REQUEST_REJECTED', 'TeacherClassRequest', requestId, `Rejected class request #${requestId}: ${reason}`);
    return { success: true, message: 'Class request marked as rejected.' };
  };

  const deactivateClass = (classId: number) => {
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.map((c: ClassEntity) => (c.id === classId ? { ...c, isActive: !c.isActive } : c)),
    }));
    return { success: true, message: 'Class status toggled.' };
  };

  const deleteClass = (classId: number) => {
    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(currentUser.role)) {
      return { success: false, message: 'Permission denied. Only managers can delete classes.' };
    }
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.filter((c: ClassEntity) => c.id !== classId),
    }));
    return { success: true, message: 'Class deleted successfully.' };
  };

  // SAVE STUDENT (with Phone Normalization, Duplicate Detection, Multi-system, and Enrollment fee status)
  const saveStudent = (studentData: Partial<Student> & { initialClassId?: number }) => {
    const isEdit = Boolean(studentData.id || studentData.centerId);
    const cleanPhone = normalizeEgyptianPhone(studentData.phone || '');

    // Duplicate check on creation
    if (!isEdit && cleanPhone) {
      const dupCheck = checkStudentDuplicate(
        cleanPhone,
        studentData.email,
        data.students,
        data.globalStudents,
        studentData.id || studentData.centerId
      );

      if (dupCheck.outcome === 'CASE_C_LOCAL_EXISTS') {
        return {
          success: false,
          message: dupCheck.message || 'Student with this phone/email is already registered in this center.',
          foundStudent: dupCheck.foundStudent,
        };
      }

      if (dupCheck.outcome === 'CASE_B_GLOBAL_EXISTS') {
        return {
          success: false,
          message: 'Student account found in KAYEDU Global Network. Use "Connect to Center" to link them without duplicating records.',
          foundStudent: dupCheck.foundStudent,
        };
      }
    }

    let updatedStudent: Student;
    const fName = studentData.firstName || studentData.name?.split(' ')[0] || 'Student';
    const lName = studentData.lastName || studentData.name?.split(' ').slice(1).join(' ') || '';
    const fullName = `${fName} ${lName}`.trim();
    const pFName = studentData.parentFirstName || studentData.guardianName?.split(' ')[0] || '';
    const pLName = studentData.parentLastName || studentData.guardianName?.split(' ').slice(1).join(' ') || '';
    const pFullName = `${pFName} ${pLName}`.trim() || studentData.guardianName || 'Parent';

    const grade = data.grades.find((g: Grade) => g.id === studentData.gradeId);
    const system = data.educationSystems.find((sys: EducationSystem) => sys.id === studentData.systemId);

    if (isEdit && (studentData.id || studentData.centerId)) {
      const targetId = studentData.id || studentData.centerId!;
      const existing = data.students.find((s: Student) => s.id === targetId || s.centerId === targetId);
      if (!existing) return { success: false, message: 'Student not found.' };

      updatedStudent = {
        ...existing,
        ...studentData,
        phone: cleanPhone || existing.phone,
        firstName: fName,
        lastName: lName,
        name: fullName,
        parentFirstName: pFName,
        parentLastName: pLName,
        guardianName: pFullName,
        guardianPhone: studentData.parentPhone || studentData.guardianPhone || existing.guardianPhone,
        gradeName: grade?.nameEn || existing.gradeName,
        gradeNameAr: grade?.nameAr || existing.gradeNameAr,
        systemId: studentData.systemId || existing.systemId || 1,
        systemName: system?.nameEn || existing.systemName || 'National',
        systemNameAr: system?.nameAr || existing.systemNameAr || 'ثانوية عامة',
      };

      setData((prev: any) => ({
        ...prev,
        students: prev.students.map((s: Student) => (s.id === targetId ? updatedStudent : s)),
      }));

      addAuditLog('STUDENT_UPDATED', 'Student', updatedStudent.id, `Updated student profile #${updatedStudent.centerId} (${updatedStudent.name})`);
    } else {
      // Center ID starts at 100
      const existingCenterIds = data.students.map((s: Student) => s.centerId || s.id);
      const nextCenterId = existingCenterIds.length > 0 ? Math.max(99, ...existingCenterIds) + 1 : 100;
      const uuid = studentData.uuid || generateUUID();
      const code = `ST${String(nextCenterId).padStart(6, '0')}`;

      updatedStudent = {
        id: nextCenterId,
        centerId: nextCenterId,
        uuid,
        code,
        firstName: fName,
        lastName: lName,
        name: fullName,
        gender: studentData.gender || 'MALE',
        phone: cleanPhone,
        altPhone: studentData.altPhone ? normalizeEgyptianPhone(studentData.altPhone) : '',
        email: studentData.email || `${fName.toLowerCase()}.${lName.toLowerCase() || nextCenterId}@student.com`,
        parentFirstName: pFName,
        parentLastName: pLName,
        parentPhone: studentData.parentPhone ? normalizeEgyptianPhone(studentData.parentPhone) : '',
        parentAltPhone: studentData.parentAltPhone || '',
        guardianName: pFullName,
        guardianPhone: studentData.parentPhone ? normalizeEgyptianPhone(studentData.parentPhone) : studentData.guardianPhone || '',
        address: studentData.address || 'Cairo, Egypt',
        birthDate: studentData.birthDate || '2008-01-01',
        school: studentData.school || 'General School',
        gradeId: studentData.gradeId || 1,
        gradeName: grade?.nameEn || 'Grade',
        gradeNameAr: grade?.nameAr || 'الصف',
        systemId: studentData.systemId || 1,
        systemName: system?.nameEn || 'National',
        systemNameAr: system?.nameAr || 'ثانوية عامة',
        registrationDate: studentData.registrationDate || new Date().toISOString().split('T')[0],
        notes: studentData.notes || '',
        isActive: studentData.isActive !== false,
        isCenterConnected: true,
        centerRelationshipStatus: 'ACTIVE',
        enrollmentFeeStatus: studentData.enrollmentFeeStatus || 'DUE',
        assignedTeacherIds: studentData.assignedTeacherIds || [],
        assignedSubjectIds: studentData.assignedSubjectIds || [],
      };

      // If initial class is selected, auto enroll
      let newEnrollments = [...data.enrollments];
      if (studentData.initialClassId) {
        const cls = data.classes.find((c: ClassEntity) => c.id === studentData.initialClassId);
        if (cls) {
          newEnrollments.push({
            id: newEnrollments.length > 0 ? Math.max(...newEnrollments.map((e) => e.id)) + 1 : 1,
            studentId: nextCenterId,
            studentName: fullName,
            studentCode: code,
            classId: cls.id,
            className: cls.name,
            teacherName: cls.teacherName,
            enrollmentDate: new Date().toISOString().split('T')[0],
            isActive: true,
            status: 'ENROLLED',
          });
        }
      }

      setData((prev: any) => ({
        ...prev,
        students: [updatedStudent, ...prev.students],
        enrollments: newEnrollments,
      }));

      addAuditLog('STUDENT_CREATED', 'Student', updatedStudent.id, `Registered new student #${updatedStudent.centerId} (${updatedStudent.name}) with Center Fee Status: ${updatedStudent.enrollmentFeeStatus}`);
    }

    return {
      success: true,
      message: isEdit
        ? `Student #${updatedStudent.centerId} updated successfully.`
        : `Student registered with Center ID: ${updatedStudent.centerId} and UUID: ${updatedStudent.uuid.substring(0, 8)}...`,
      student: updatedStudent,
    };
  };

  const connectGlobalStudentToCenter = (studentId: number) => {
    const globalS = (data.globalStudents || []).find((s: Student) => s.id === studentId);
    if (!globalS) return { success: false, message: 'Student account not found in KAYEDU registry.' };

    const alreadyInCenter = data.students.some((s: Student) => s.id === studentId || s.phone === globalS.phone);
    if (alreadyInCenter) return { success: false, message: 'Student is already active at this center.' };

    const existingCenterIds = data.students.map((s: Student) => s.centerId || s.id);
    const nextCenterId = existingCenterIds.length > 0 ? Math.max(99, ...existingCenterIds) + 1 : 100;

    const connectedStudent: Student = {
      ...globalS,
      centerId: nextCenterId,
      isCenterConnected: true,
      centerRelationshipStatus: 'ACTIVE',
      enrollmentFeeStatus: 'DUE',
    };

    setData((prev: any) => ({
      ...prev,
      students: [connectedStudent, ...prev.students],
    }));

    addAuditLog('STUDENT_CONNECTED', 'Student', connectedStudent.id, `Connected existing KAYEDU student ${connectedStudent.name} (Assigned Local Center ID #${nextCenterId})`);

    return {
      success: true,
      message: `Connected ${connectedStudent.name} to 60 Education Center (Local Center ID #${nextCenterId}).`,
      student: connectedStudent,
    };
  };

  const collectEnrollmentFee = (studentId: number, amount = 100, paymentMethod: PaymentMethod = 'CASH') => {
    const student = data.students.find((s: Student) => s.id === studentId || s.centerId === studentId);
    if (!student) return { success: false, message: 'Student not found.' };

    setData((prev: any) => ({
      ...prev,
      students: prev.students.map((s: Student) =>
        s.id === student.id || s.centerId === student.id
          ? { ...s, enrollmentFeeStatus: 'PAID' }
          : s
      ),
    }));

    addAuditLog('ENROLLMENT_FEE_COLLECTED', 'Student', student.id, `Collected center registration fee (${amount} EGP via ${paymentMethod}) for ${student.name}`);
    return { success: true, message: `Collected center registration fee of ${amount} EGP for ${student.name}.` };
  };

  const deleteStudent = (studentId: number) => {
    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(currentUser.role)) {
      return { success: false, message: 'Permission denied. Only managers can delete student records.' };
    }

    setData((prev: any) => ({
      ...prev,
      students: prev.students.filter((s: Student) => s.id !== studentId && s.centerId !== studentId),
      enrollments: prev.enrollments.filter((e: Enrollment) => e.studentId !== studentId),
    }));

    return { success: true, message: 'Student and enrollments deleted.' };
  };

  // PROMOTE STUDENT GRADE (e.g. End of Term Promotion)
  const promoteStudentGrades = (studentIds?: number[] | 'ALL') => {
    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(currentUser.role)) {
      return { success: false, message: 'Permission denied. Only managers can promote student terms.', count: 0 };
    }

    const sortedGrades = [...data.grades].sort((a, b) => a.displayOrder - b.displayOrder);
    let promotedCount = 0;

    setData((prev: any) => {
      const updatedStudents = prev.students.map((st: Student) => {
        if (studentIds === 'ALL' || (Array.isArray(studentIds) && studentIds.includes(st.id))) {
          const currentGradeIndex = sortedGrades.findIndex((g) => g.id === st.gradeId);
          if (currentGradeIndex !== -1 && currentGradeIndex < sortedGrades.length - 1) {
            const nextGrade = sortedGrades[currentGradeIndex + 1];
            promotedCount++;
            return {
              ...st,
              gradeId: nextGrade.id,
              gradeName: nextGrade.nameEn,
              gradeNameAr: nextGrade.nameAr,
            };
          }
        }
        return st;
      });

      return { ...prev, students: updatedStudents };
    });

    return {
      success: true,
      message: `Successfully promoted ${promotedCount} students to the next term grade.`,
      count: promotedCount,
    };
  };

  // ENROLL STUDENT (with Capacity check and Schedule overlap check)
  const enrollStudent = (studentId: number, classId: number, isOneTime = false) => {
    const student = data.students.find((s: Student) => s.id === studentId || s.centerId === studentId);
    const cls = data.classes.find((c: ClassEntity) => c.id === classId);

    if (!student || !cls) return { success: false, message: 'Student or Class not found.' };

    const exists = data.enrollments.some(
      (e: Enrollment) => (e.studentId === studentId || e.studentId === student.centerId) && e.classId === classId && e.isActive
    );

    if (exists) return { success: false, message: 'Student is already enrolled in this class.' };

    // Capacity check
    const capacityCheck = validateClassCapacity(cls, data.enrollments);
    if (!capacityCheck.canEnroll) {
      return { success: false, message: capacityCheck.message };
    }

    // Schedule conflict check
    const conflictCheck = validateStudentClassEnrollmentScheduleConflict(student.centerId || student.id, cls, data.classes, data.enrollments);
    if (conflictCheck.hasConflict) {
      return { success: false, message: conflictCheck.message };
    }

    const newId = data.enrollments.length > 0 ? Math.max(...data.enrollments.map((e) => e.id)) + 1 : 1;
    const newEnrollment: Enrollment = {
      id: newId,
      studentId: student.centerId || student.id,
      studentName: student.name,
      studentCode: student.code,
      classId: cls.id,
      className: cls.name,
      teacherName: cls.teacherName,
      enrollmentDate: new Date().toISOString().split('T')[0],
      isActive: true,
      isOneTimeSession: isOneTime,
      status: cls.acceptanceMode === 'CONFIRMATION_REQUIRED' && currentUser.role === 'STUDENT' ? 'PENDING_CONFIRMATION' : 'ENROLLED',
    };

    setData((prev: any) => ({
      ...prev,
      enrollments: [newEnrollment, ...prev.enrollments],
    }));

    addAuditLog('STUDENT_ENROLLED', 'Enrollment', newEnrollment.id, `Enrolled ${student.name} into ${cls.name}`);

    return {
      success: true,
      message: newEnrollment.status === 'PENDING_CONFIRMATION'
        ? 'Enrollment request submitted to instructor for approval.'
        : `Successfully enrolled ${student.name} into ${cls.name}.`,
    };
  };

  const unenrollStudent = (enrollmentId: number) => {
    setData((prev: any) => ({
      ...prev,
      enrollments: prev.enrollments.map((e: Enrollment) => (e.id === enrollmentId ? { ...e, isActive: false } : e)),
    }));
    return { success: true, message: 'Student enrollment ended.' };
  };

  // SCHEDULE SLOT
  const saveScheduleSlot = (slotData: Partial<ScheduleSlot>) => {
    const cls = data.classes.find((c: ClassEntity) => c.id === slotData.classId);
    const room = data.rooms.find((r: Room) => r.id === slotData.roomId);

    const newId = data.scheduleSlots.length > 0 ? Math.max(...data.scheduleSlots.map((s) => s.id)) + 1 : 1;
    const newSlot: ScheduleSlot = {
      id: newId,
      classId: slotData.classId || 1,
      className: cls?.name || 'Class',
      teacherId: cls?.teacherId || 1,
      teacherName: cls?.teacherName || 'Teacher',
      subjectName: cls?.subjectName || 'Subject',
      gradeName: cls?.gradeName || 'Grade',
      systemName: cls?.systemName || 'System',
      roomId: slotData.roomId || 1,
      roomName: room?.nameEn || 'Room',
      roomNameAr: room?.nameAr || 'القاعة',
      dayOfWeek: slotData.dayOfWeek || 'SATURDAY',
      startTime: slotData.startTime || '10:00',
      endTime: slotData.endTime || '12:00',
      isActive: true,
    };

    setData((prev: any) => ({
      ...prev,
      scheduleSlots: [newSlot, ...prev.scheduleSlots],
    }));

    return { success: true, message: 'Schedule slot added.' };
  };

  // CREATE / OPEN SESSION
  const createSession = (classId: number, roomId: number, date: string, startTime: string, endTime: string) => {
    const cls = data.classes.find((c: ClassEntity) => c.id === classId);
    const room = data.rooms.find((r: Room) => r.id === roomId);

    if (!cls) return { success: false, message: 'Class not found.' };

    const newId = data.sessions.length > 0 ? Math.max(...data.sessions.map((s) => s.id)) + 1 : 1;
    const newSession: ClassSession = {
      id: newId,
      classId: cls.id,
      className: cls.name,
      teacherId: cls.teacherId,
      teacherName: cls.teacherName || 'Teacher',
      subjectName: cls.subjectName || 'Subject',
      gradeName: cls.gradeName || 'Grade',
      systemName: cls.systemName || 'System',
      roomId: room?.id || 1,
      roomName: room?.nameEn || 'Room',
      sessionDate: date,
      startTime,
      endTime,
      status: 'OPEN',
      lessonPrice: cls.lessonPrice,
      centerShare: cls.centerShare,
      teacherShare: cls.teacherShare,
      isSettled: false,
      files: [],
      notes: `Session for ${cls.name}`,
    };

    setData((prev: any) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
    }));

    return { success: true, message: 'Session opened successfully.', session: newSession };
  };

  const openSession = createSession;

  const updateSessionStatus = (sessionId: number, status: SessionStatus) => {
    setData((prev: any) => ({
      ...prev,
      sessions: prev.sessions.map((s: ClassSession) => (s.id === sessionId ? { ...s, status } : s)),
    }));
    return { success: true, message: `Session status updated to ${status}.` };
  };

  const cancelSession = (sessionId: number, reason?: string) => {
    const session = data.sessions.find((s: ClassSession) => s.id === sessionId);
    if (!session) return { success: false, message: 'Session not found.' };

    if (!canTeacherEditSession(session)) {
      return {
        success: false,
        message: `Teacher session cancellation is locked by center policy (${data.managerDueConfig?.teacherEditDeadlineHours || 24}h rule). Contact center management.`,
      };
    }

    setData((prev: any) => ({
      ...prev,
      sessions: prev.sessions.map((s: ClassSession) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'CANCELLED',
              cancelledBy: currentUser.fullName,
              cancelledAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              cancellationReason: reason || 'Cancelled by instructor / center desk',
            }
          : s
      ),
    }));

    return { success: true, message: 'Session has been marked as Cancelled.' };
  };

  // SESSION FILE ATTACHMENTS
  const addSessionFile = (sessionId: number, fileData: { name: string; size: string; type: string; url?: string }) => {
    const newFile: SessionFile = {
      id: `file_${Date.now()}`,
      sessionId,
      name: fileData.name,
      size: fileData.size || '1.5 MB',
      type: fileData.type || 'pdf',
      url: fileData.url || '#',
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      uploadedBy: currentUser.fullName,
      uploadedByRole: currentUser.role,
      downloadCount: 0,
    };

    setData((prev: any) => ({
      ...prev,
      sessions: prev.sessions.map((s: ClassSession) =>
        s.id === sessionId ? { ...s, files: [...(s.files || []), newFile] } : s
      ),
    }));

    return { success: true, message: 'Document / Study material uploaded for students.', file: newFile };
  };

  const removeSessionFile = (sessionId: number, fileId: string) => {
    setData((prev: any) => ({
      ...prev,
      sessions: prev.sessions.map((s: ClassSession) =>
        s.id === sessionId ? { ...s, files: (s.files || []).filter((f) => f.id !== fileId) } : s
      ),
    }));
    return { success: true, message: 'File attachment removed.' };
  };

  // PAY & ATTEND (Cash default, InstaPay, Wallet, Visa)
  const processPayAndAttend = (params: {
    studentId: number;
    sessionId: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    attendanceStatus: AttendanceStatus;
    receivedBy?: string;
  }) => {
    const session = data.sessions.find((s: ClassSession) => s.id === params.sessionId);
    const student = data.students.find((s: Student) => s.id === params.studentId || s.centerId === params.studentId);

    if (!session || !student) return { success: false, message: 'Session or Student not found.' };

    const receiptNum = `REC-2026-${String(data.payments.length + 1).padStart(4, '0')}`;
    const paymentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const payment: StudentPayment = {
      id: data.payments.length > 0 ? Math.max(...data.payments.map((p) => p.id)) + 1 : 1,
      receiptNumber: receiptNum,
      studentId: student.centerId || student.id,
      studentName: student.name,
      studentCode: student.code,
      sessionId: session.id,
      classId: session.classId,
      className: session.className,
      teacherId: session.teacherId,
      teacherName: session.teacherName,
      lessonPrice: session.lessonPrice,
      centerShare: session.centerShare,
      teacherShare: session.teacherShare,
      amountPaid: params.amountPaid,
      paymentMethod: params.paymentMethod || 'CASH',
      paymentDate,
      receivedBy: params.receivedBy || `${currentUser.fullName} (${currentUser.role})`,
      isCancelled: false,
    };

    const attendanceRec: AttendanceRecord = {
      id: data.attendance.length > 0 ? Math.max(...data.attendance.map((a) => a.id)) + 1 : 1,
      sessionId: session.id,
      studentId: student.centerId || student.id,
      studentName: student.name,
      studentCode: student.code,
      status: params.attendanceStatus || 'PRESENT',
      recordedAt: paymentDate,
    };

    setData((prev: any) => ({
      ...prev,
      payments: [payment, ...prev.payments],
      attendance: [
        ...prev.attendance.filter((a: AttendanceRecord) => !(a.sessionId === session.id && a.studentId === student.id)),
        attendanceRec,
      ],
    }));

    return {
      success: true,
      message: `Recorded ${params.amountPaid} EGP payment via ${params.paymentMethod} & marked attendance for ${student.name}.`,
      payment,
      receiptNumber: receiptNum,
    };
  };

  // TEACHER SETTLEMENT
  const processTeacherSettlement = (params: {
    teacherId: number;
    sessionIds: number[];
    deductions: number;
    deductionNotes?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const teacher = data.teachers.find((t: Teacher) => t.id === params.teacherId);
    if (!teacher) return { success: false, message: 'Teacher not found.' };

    const settledPayments = data.payments.filter((p: StudentPayment) => params.sessionIds.includes(p.sessionId) && !p.isCancelled);
    const grossRevenue = settledPayments.reduce((s: number, p: StudentPayment) => s + p.amountPaid, 0);
    const centerShareTotal = settledPayments.reduce((s: number, p: StudentPayment) => s + p.centerShare, 0);
    const teacherEarningsTotal = settledPayments.reduce((s: number, p: StudentPayment) => s + p.teacherShare, 0);
    const netPayout = Math.max(0, teacherEarningsTotal - (params.deductions || 0));

    const settlementCode = `STL-2026-${String(data.settlements.length + 1).padStart(4, '0')}`;
    const newSettlement: TeacherSettlement = {
      id: data.settlements.length > 0 ? Math.max(...data.settlements.map((s) => s.id)) + 1 : 1,
      settlementCode,
      teacherId: teacher.id,
      teacherName: teacher.name,
      settlementDate: new Date().toISOString().split('T')[0],
      sessionIds: params.sessionIds,
      totalSessions: params.sessionIds.length,
      totalStudentsAttended: settledPayments.length,
      grossRevenue,
      centerShareTotal,
      teacherEarningsTotal,
      deductions: params.deductions || 0,
      deductionNotes: params.deductionNotes,
      netPayout,
      paymentMethod: params.paymentMethod,
      processedBy: currentUser.fullName,
      status: 'PAID',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: params.notes,
    };

    setData((prev: any) => ({
      ...prev,
      settlements: [newSettlement, ...prev.settlements],
      sessions: prev.sessions.map((s: ClassSession) =>
        params.sessionIds.includes(s.id) ? { ...s, isSettled: true, settlementId: newSettlement.id } : s
      ),
    }));

    return { success: true, message: `Settlement ${settlementCode} created for ${teacher.name}.`, settlement: newSettlement };
  };

  // EXPENSES
  const saveExpense = (expenseData: Partial<ExpenseRecord>) => {
    const voucherNumber = `EXP-2026-${String(data.expenses.length + 1).padStart(4, '0')}`;
    const newExpense: ExpenseRecord = {
      id: data.expenses.length > 0 ? Math.max(...data.expenses.map((e) => e.id)) + 1 : 1,
      voucherNumber,
      category: expenseData.category || 'MISCELLANEOUS',
      description: expenseData.description || 'Center Expense',
      recipientVendor: expenseData.recipientVendor || 'General Vendor',
      amount: expenseData.amount || 0,
      expenseDate: expenseData.expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: expenseData.paymentMethod || 'CASH',
      recordedBy: currentUser.fullName,
      approvedBy: currentUser.role === 'ADMIN' || currentUser.role === 'OWNER' ? currentUser.fullName : 'Admin Pending',
      notes: expenseData.notes || '',
    };

    setData((prev: any) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    return { success: true, message: `Expense recorded: ${newExpense.amount} EGP (${newExpense.category}).` };
  };

  const recordExpense = saveExpense;

  // SETUP ACTIONS
  const saveSubject = (subject: Partial<Subject>) => {
    const newId = data.subjects.length > 0 ? Math.max(...data.subjects.map((s) => s.id)) + 1 : 1;
    const newSub: Subject = {
      id: newId,
      nameEn: subject.nameEn || 'Subject',
      nameAr: subject.nameAr || 'مادة',
      code: subject.code || `SUB${newId}`,
      gradeId: subject.gradeId,
      displayOrder: subject.displayOrder || data.subjects.length + 1,
      isActive: true,
    };
    setData((prev: any) => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    return { success: true, message: 'Subject added.' };
  };

  const saveGrade = (grade: Partial<Grade>) => {
    const newId = data.grades.length > 0 ? Math.max(...data.grades.map((g) => g.id)) + 1 : 1;
    const newG: Grade = {
      id: newId,
      nameEn: grade.nameEn || 'Grade',
      nameAr: grade.nameAr || 'الصف',
      code: grade.code || `G${newId}`,
      educationalType: grade.educationalType || 'Standard',
      displayOrder: grade.displayOrder || data.grades.length + 1,
      isActive: true,
    };
    setData((prev: any) => ({ ...prev, grades: [...prev.grades, newG] }));
    return { success: true, message: 'Grade added.' };
  };

  const saveRoom = (room: Partial<Room>) => {
    const newId = data.rooms.length > 0 ? Math.max(...data.rooms.map((r) => r.id)) + 1 : 1;
    const newR: Room = {
      id: newId,
      nameEn: room.nameEn || 'Hall',
      nameAr: room.nameAr || 'قاعة',
      capacity: room.capacity || 40,
      floor: room.floor || '1st Floor',
      notes: room.notes || '',
      isActive: true,
    };
    setData((prev: any) => ({ ...prev, rooms: [...prev.rooms, newR] }));
    return { success: true, message: 'Room added.' };
  };

  const updateEducationSystemRate = (systemId: number, newCenterShare: number, notes?: string) => {
    setData((prev: any) => ({
      ...prev,
      educationSystems: prev.educationSystems.map((sys: EducationSystem) => {
        if (sys.id === systemId) {
          const newHistory = [
            ...sys.rateHistory,
            {
              id: Date.now(),
              systemId: sys.id,
              centerShare: newCenterShare,
              effectiveFrom: new Date().toISOString().split('T')[0],
              effectiveTo: null,
              isActive: true,
              notes: notes || 'Updated center deduction rate',
              createdBy: currentUser.fullName,
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            },
          ];
          return {
            ...sys,
            currentCenterShare: newCenterShare,
            rateHistory: newHistory,
          };
        }
        return sys;
      }),
    }));
    return { success: true, message: `System center share rate updated to ${newCenterShare} EGP.` };
  };

  // INVITATIONS & PHONE VERIFICATION
  const inviteUserWithRole = (email: string, role: UserRole) => {
    if (['OWNER', 'MANAGER', 'RECEPTION'].includes(role) && !['ADMIN', 'OWNER'].includes(currentUser.role)) {
      return { success: false, message: 'Only Admins and Owners can invite management staff.' };
    }

    const invitation: UserInvitation = {
      id: `inv_${Date.now()}`,
      email: email.trim().toLowerCase(),
      role,
      invitedBy: `${currentUser.fullName} (${currentUser.role})`,
      invitedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'PENDING',
      token: `inv_tok_${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setData((prev: any) => ({
      ...prev,
      invitations: [invitation, ...(prev.invitations || [])],
    }));

    return {
      success: true,
      message: `Invitation email dispatched to ${email} with registration token: ${invitation.token}`,
      invitation,
    };
  };

  const cancelInvitation = (invitationId: string) => {
    setData((prev: any) => ({
      ...prev,
      invitations: (prev.invitations || []).filter((i: UserInvitation) => i.id !== invitationId),
    }));
    return { success: true, message: 'Invitation link revoked.' };
  };

  const verifyPhoneNumber = (phone: string, otpCode: string) => {
    if (otpCode.length < 4) {
      return { success: false, message: 'Invalid OTP verification code. Please enter 4 digits.' };
    }
    return { success: true, message: `Phone number ${phone} successfully verified via SMS / WhatsApp OTP.` };
  };

  // AUTH ACTIONS
  const loginUser = (email: string, password?: string) => {
    const trimmed = email.trim().toLowerCase();
    const user = data.users.find(
      (u: User) => u.email.toLowerCase() === trimmed || u.username.toLowerCase() === trimmed
    );

    if (!user) {
      return { success: false, message: 'No account found with this email or username.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'This staff account has been deactivated. Please contact your center administrator.' };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCurrentUser(updatedUser);
    setIsUserLoggedIn(true);

    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => (u.id === user.id ? updatedUser : u)),
    }));

    return { success: true, message: `Welcome back, ${user.fullName}!`, user: updatedUser };
  };

  const registerUser = (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    role?: UserRole;
  }) => {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const existing = data.users.find((u: User) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const role = payload.role || 'RECEPTION';
    const newId = data.users.length > 0 ? Math.max(...data.users.map((u: User) => u.id)) + 1 : 1;
    const fullName = `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();

    const newUser: User = {
      id: newId,
      username: trimmedEmail.split('@')[0],
      fullName,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: trimmedEmail,
      phoneNumber: payload.phoneNumber.trim(),
      phone: payload.phoneNumber.trim(),
      password: payload.password || 'password123',
      role,
      permissions: getPermissionsForRole(role),
      isActive: true,
      isEmailConfirmed: true,
      isPhoneConfirmed: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // If teacher role, auto create Teacher entry
    let newTeachers = [...data.teachers];
    if (role === 'TEACHER') {
      const tId = newTeachers.length > 0 ? Math.max(...newTeachers.map((t) => t.id)) + 1 : 1;
      const newT: Teacher = {
        id: tId,
        code: `T${String(tId).padStart(5, '0')}`,
        firstName: payload.firstName,
        lastName: payload.lastName,
        name: fullName,
        phone: payload.phoneNumber,
        email: trimmedEmail,
        address: 'Cairo, Egypt',
        hireDate: new Date().toISOString().split('T')[0],
        notes: 'Self-registered instructor',
        isActive: true,
        lastSessionCompletedDate: new Date().toISOString().split('T')[0],
        assignedCenterIds: [1],
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      newUser.teacherId = tId;
      newTeachers.push(newT);
    }

    // If student role, auto create Student entry
    let newStudents = [...data.students];
    if (role === 'STUDENT') {
      const existingCenterIds = newStudents.map((s: Student) => s.centerId || s.id);
      const nextCenterId = existingCenterIds.length > 0 ? Math.max(99, ...existingCenterIds) + 1 : 100;
      const uuid = generateUUID();
      const newSt: Student = {
        id: nextCenterId,
        centerId: nextCenterId,
        uuid,
        code: `ST${String(nextCenterId).padStart(6, '0')}`,
        firstName: payload.firstName,
        lastName: payload.lastName,
        name: fullName,
        phone: payload.phoneNumber,
        email: trimmedEmail,
        guardianName: 'Parent / Guardian',
        guardianPhone: payload.phoneNumber,
        address: 'Cairo, Egypt',
        school: 'General School',
        gradeId: 1,
        gradeName: 'Grade 8',
        gradeNameAr: 'الصف الثامن',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: 'Self-registered student account',
        isActive: true,
      };
      newUser.studentId = nextCenterId;
      newStudents.push(newSt);
    }

    setData((prev: any) => ({
      ...prev,
      users: [...prev.users, newUser],
      teachers: newTeachers,
      students: newStudents,
    }));

    setCurrentUser(newUser);
    setIsUserLoggedIn(true);

    return { success: true, message: `Account created successfully! Welcome, ${fullName}.`, user: newUser };
  };

  const logoutUser = () => {
    setIsUserLoggedIn(false);
  };

  const switchActiveAccount = (userId: number) => {
    const targetUser = data.users.find((u: User) => u.id === userId);
    if (!targetUser) return { success: false, message: 'Account not found.' };

    if (!targetUser.isActive) {
      return { success: false, message: 'Cannot switch to a deactivated account.' };
    }

    setCurrentUser(targetUser);
    setIsUserLoggedIn(true);
    return { success: true, message: `Switched active session to ${targetUser.fullName}.`, user: targetUser };
  };

  const saveUser = (userData: Partial<User>) => {
    let updatedUser: User;
    const isEdit = Boolean(userData.id);

    if (isEdit && userData.id) {
      const existing = data.users.find((u: User) => u.id === userData.id);
      if (!existing) return { success: false, message: 'User not found.' };

      const role = userData.role || existing.role;
      updatedUser = {
        ...existing,
        ...userData,
        role,
        permissions: getPermissionsForRole(role),
      };

      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => (u.id === userData.id ? updatedUser : u)),
      }));

      if (currentUser.id === userData.id) {
        setCurrentUser(updatedUser);
      }
    } else {
      const newId = data.users.length > 0 ? Math.max(...data.users.map((u: User) => u.id)) + 1 : 1;
      const role = userData.role || 'RECEPTION';
      const fName = userData.firstName || userData.fullName?.split(' ')[0] || 'Staff';
      const lName = userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '';

      updatedUser = {
        id: newId,
        username: userData.username || (userData.email ? userData.email.split('@')[0] : `user_${newId}`),
        fullName: userData.fullName || `${fName} ${lName}`.trim(),
        firstName: fName,
        lastName: lName,
        email: userData.email || `user_${newId}@60center.com`,
        phoneNumber: userData.phoneNumber || userData.phone || '01000000000',
        phone: userData.phoneNumber || userData.phone || '01000000000',
        password: userData.password || 'password123',
        role,
        permissions: getPermissionsForRole(role),
        isActive: userData.isActive !== false,
        isEmailConfirmed: true,
        isPhoneConfirmed: true,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      setData((prev: any) => ({
        ...prev,
        users: [...prev.users, updatedUser],
      }));
    }

    return {
      success: true,
      message: isEdit ? 'Account details updated successfully.' : 'New employee account added.',
      user: updatedUser,
    };
  };

  const deleteUser = (userId: number) => {
    if (currentUser.id === userId) {
      return { success: false, message: 'You cannot delete your own active signed-in account.' };
    }
    setData((prev: any) => ({
      ...prev,
      users: prev.users.filter((u: User) => u.id !== userId),
    }));
    return { success: true, message: 'Account deleted successfully.' };
  };

  const deactivateUser = (userId: number) => {
    if (currentUser.id === userId) {
      return { success: false, message: 'You cannot deactivate your own active signed-in account.' };
    }
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
    }));
    return { success: true, message: 'Account active status toggled.' };
  };

  const resetDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setData({
      users: initialUsers,
      subjects: initialSubjects,
      grades: initialGrades,
      educationSystems: initialEducationSystems,
      rooms: initialRooms,
      teachers: initialTeachers,
      classes: initialClasses,
      students: initialStudents,
      enrollments: initialEnrollments,
      scheduleSlots: initialScheduleSlots,
      sessions: initialSessions,
      attendance: initialAttendance,
      payments: initialPayments,
      settlements: initialSettlements,
      expenses: initialExpenses,
      auditLogs: initialAuditLogs,
      teacherTimeoutConfig: initialTeacherTimeoutConfig,
      cardCustomizationConfig: initialCardCustomizationConfig,
      managerDueConfig: initialManagerDueConfig,
      invitations: initialInvitations,
    });
    setCurrentUser(initialUsers[0]);
    setIsUserLoggedIn(true);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        currentLanguage: language,
        setLanguage,
        isRtl,
        t,
        currentUser,
        setCurrentUser,
        switchUserRole,
        hasPermission,
        activeTab,
        setActiveTab,
        currentView: activeTab,
        setCurrentView: setActiveTab,
        selectedSessionId,
        setSelectedSessionId,
        navigateToSessionDetail,

        // Data
        users: data.users,
        subjects: data.subjects,
        grades: data.grades,
        educationSystems: data.educationSystems,
        rooms: data.rooms,
        teachers: data.teachers,
        classes: data.classes,
        students: data.students,
        enrollments: data.enrollments,
        scheduleSlots: data.scheduleSlots,
        sessions: data.sessions,
        attendance: data.attendance,
        payments: data.payments,
        settlements: data.settlements,
        expenses: data.expenses,
        auditLogs: data.auditLogs,
        invitations: data.invitations,
        teacherClassRequests: data.teacherClassRequests || [],
        crossCenterBookings: data.crossCenterBookings || [],
        globalStudents: data.globalStudents || [],
        globalTeachers: data.globalTeachers || [],

        // Configs
        teacherTimeoutConfig: data.teacherTimeoutConfig,
        setTeacherTimeoutConfig,
        cardCustomizationConfig: data.cardCustomizationConfig,
        setCardCustomizationConfig,
        managerDueConfig: data.managerDueConfig,
        setManagerDueConfig,
        enrollmentFeeConfig: data.enrollmentFeeConfig || initialEnrollmentFeeConfig,
        setEnrollmentFeeConfig,

        // Actions
        saveTeacher,
        deactivateTeacher,
        deleteTeacher,
        connectGlobalTeacherToCenter,
        saveClass,
        deactivateClass,
        deleteClass,
        approveClassRequest,
        rejectClassRequest,
        saveStudent,
        deleteStudent,
        promoteStudentGrades,
        enrollStudent,
        unenrollStudent,
        connectGlobalStudentToCenter,
        collectEnrollmentFee,
        saveScheduleSlot,
        openSession,
        createSession,
        updateSessionStatus,
        cancelSession,
        canTeacherEditSession,
        addSessionFile,
        removeSessionFile,
        processPayAndAttend,
        processTeacherSettlement,
        saveExpense,
        recordExpense,
        saveSubject,
        saveGrade,
        saveRoom,
        updateEducationSystemRate,

        // Invitations & Verification
        inviteUserWithRole,
        cancelInvitation,
        verifyPhoneNumber,

        // Auth
        isAuthModalOpen,
        setIsAuthModalOpen,
        authInitialMode,
        setAuthInitialMode,
        openAuthModal,
        isAccountsControlModalOpen,
        setIsAccountsControlModalOpen,
        openAccountsControlModal,
        isUserLoggedIn,
        loginUser,
        registerUser,
        logoutUser,
        switchActiveAccount,
        saveUser,
        deleteUser,
        deactivateUser,

        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
