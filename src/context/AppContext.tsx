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
} from '../data/initialData';
import { getT } from '../i18n/translations';

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

  // Entity Actions
  saveTeacher: (teacherData: Partial<Teacher>) => { success: boolean; message: string; teacher?: Teacher };
  deactivateTeacher: (teacherId: number) => { success: boolean; message: string };
  
  saveClass: (classData: {
    id?: number;
    name: string;
    teacherId: number;
    subjectId: number;
    gradeId: number;
    systemId: number;
    lessonPrice: number;
    isActive?: boolean;
    notes?: string;
  }) => { success: boolean; message: string; classEntity?: ClassEntity };
  deactivateClass: (classId: number) => { success: boolean; message: string };

  saveStudent: (studentData: Partial<Student>) => { success: boolean; message: string; student?: Student };
  enrollStudent: (studentId: number, classId: number) => { success: boolean; message: string };

  saveScheduleSlot: (slotData: Partial<ScheduleSlot>) => { success: boolean; message: string };
  openSession: (classId: number, roomId: number, date: string, startTime: string, endTime: string) => { success: boolean; message: string; session?: ClassSession };
  createSession: (classId: number, roomId: number, date: string, startTime: string, endTime: string) => { success: boolean; message: string; session?: ClassSession };
  updateSessionStatus: (sessionId: number, status: SessionStatus) => { success: boolean; message: string };

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

const LOCAL_STORAGE_KEY = '60_education_center_erp_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('60_center_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const [activeTab, setActiveTab] = useState<NavView>('teachersDashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]); // Default to Admin
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
        return JSON.parse(saved);
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
      case 'ADMIN':
        return [
          'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT', 'TEACHER_DEACTIVATE',
          'CLASS_VIEW', 'CLASS_CREATE', 'CLASS_EDIT', 'CLASS_DEACTIVATE',
          'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'ENROLLMENT_MANAGE',
          'SCHEDULE_VIEW', 'SCHEDULE_MANAGE', 'SESSION_MANAGE', 'ATTENDANCE_MARK',
          'PAYMENT_CREATE', 'PAYMENT_VIEW', 'PAYMENT_CANCEL',
          'SETTLEMENT_VIEW', 'SETTLEMENT_CREATE', 'SETTLEMENT_APPROVE',
          'EXPENSE_MANAGE', 'SETUP_VIEW', 'SETUP_EDIT', 'FINANCIAL_CONFIG_EDIT',
          'USER_ADMIN', 'AUDIT_VIEW', 'REPORT_OPERATIONAL', 'REPORT_FINANCIAL', 'CEO_DASHBOARD'
        ];
      case 'CEO':
        return [
          'TEACHER_VIEW', 'CLASS_VIEW', 'STUDENT_VIEW', 'SCHEDULE_VIEW',
          'SETTLEMENT_VIEW', 'REPORT_FINANCIAL', 'REPORT_OPERATIONAL',
          'CEO_DASHBOARD', 'AUDIT_VIEW'
        ];
      case 'MANAGER':
        return [
          'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT',
          'CLASS_VIEW', 'CLASS_CREATE', 'CLASS_EDIT',
          'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'ENROLLMENT_MANAGE',
          'SCHEDULE_VIEW', 'SCHEDULE_MANAGE', 'SESSION_MANAGE', 'ATTENDANCE_MARK',
          'REPORT_OPERATIONAL', 'EXPENSE_MANAGE'
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
          'TEACHER_VIEW', 'CLASS_VIEW', 'SCHEDULE_VIEW', 'ATTENDANCE_MARK'
        ];
      default:
        return ['TEACHER_VIEW', 'CLASS_VIEW', 'STUDENT_VIEW', 'SCHEDULE_VIEW'];
    }
  };

  const loginUser = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = data.users.find((u: User) => (u.email && u.email.toLowerCase() === cleanEmail) || (u.username && u.username.toLowerCase() === cleanEmail));

    if (!foundUser) {
      return { success: false, message: isRtl ? 'لم يتم العثور على حساب بهذا البريد الإلكتروني أو اسم المستخدم.' : 'No user account found with this email or username.' };
    }

    if (!foundUser.isActive) {
      return { success: false, message: isRtl ? 'هذا الحساب معطل حالياً. يرجى مراجعة إدارة السنتر.' : 'This account is currently deactivated. Please contact center administration.' };
    }

    if (password && foundUser.password && foundUser.password !== password) {
      return { success: false, message: isRtl ? 'كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.' : 'Invalid password. Please verify and try again.' };
    }

    const updatedUser: User = {
      ...foundUser,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCurrentUser(updatedUser);
    setIsUserLoggedIn(true);
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u),
    }));

    logAudit('USER_LOGIN', 'AUTH', updatedUser.id, `User ${updatedUser.fullName} (${updatedUser.role}) logged in successfully.`);
    return { success: true, message: isRtl ? `مرحباً بك، ${updatedUser.fullName}` : `Welcome back, ${updatedUser.fullName}`, user: updatedUser };
  };

  const registerUser = (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    role?: UserRole;
  }) => {
    const cleanEmail = payload.email.trim().toLowerCase();
    if (!payload.firstName.trim() || !payload.lastName.trim() || !cleanEmail) {
      return { success: false, message: isRtl ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.' };
    }

    const existing = data.users.find((u: User) => u.email && u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: isRtl ? 'البريد الإلكتروني مسجل بالفعل لموظف آخر.' : 'An account with this email already exists.' };
    }

    const nextId = (data.users.length > 0 ? Math.max(...data.users.map((u: User) => u.id)) : 0) + 1;
    const role: UserRole = payload.role || 'RECEPTION';
    const fullName = `${payload.firstName.trim()} ${payload.lastName.trim()}`;
    const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    const newUser: User = {
      id: nextId,
      username,
      fullName,
      fullNameAr: fullName,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: cleanEmail,
      phoneNumber: payload.phoneNumber.trim(),
      phone: payload.phoneNumber.trim(),
      password: payload.password || 'password123',
      role,
      permissions: getPermissionsForRole(role),
      isActive: true,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setData((prev: any) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));

    setCurrentUser(newUser);
    setIsUserLoggedIn(true);
    logAudit('USER_REGISTER', 'AUTH', newUser.id, `Created new employee account for ${newUser.fullName} with role ${newUser.role}`);
    return { success: true, message: isRtl ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح!' : 'Account registered and logged in successfully!', user: newUser };
  };

  const switchActiveAccount = (userId: number) => {
    const target = data.users.find((u: User) => u.id === userId);
    if (!target) {
      return { success: false, message: isRtl ? 'لم يتم العثور على الحساب المطلوب.' : 'Account not found.' };
    }
    if (!target.isActive) {
      return { success: false, message: isRtl ? 'لا يمكن التبديل لحساب معطل.' : 'Cannot switch to a deactivated account.' };
    }
    const updated = {
      ...target,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setCurrentUser(updated);
    setIsUserLoggedIn(true);
    logAudit('ACCOUNT_SWITCH', 'AUTH', target.id, `Switched active session to ${target.fullName} (${target.role})`);
    return { success: true, message: isRtl ? `تم التبديل إلى حساب: ${target.fullName}` : `Switched to ${target.fullName}`, user: updated };
  };

  const logoutUser = () => {
    if (currentUser) {
      logAudit('USER_LOGOUT', 'AUTH', currentUser.id, `User ${currentUser.fullName} signed out.`);
    }
    setIsUserLoggedIn(false);
  };

  const saveUser = (userData: Partial<User>) => {
    if (userData.id) {
      let updated: User | undefined;
      setData((prev: any) => {
        const list = prev.users.map((u: User) => {
          if (u.id === userData.id) {
            const newRole = userData.role || u.role;
            updated = {
              ...u,
              ...userData,
              permissions: userData.role && userData.role !== u.role ? getPermissionsForRole(newRole) : (userData.permissions || u.permissions),
            };
            return updated;
          }
          return u;
        });
        return { ...prev, users: list };
      });
      if (updated && currentUser.id === updated.id) {
        setCurrentUser(updated);
      }
      logAudit('USER_UPDATE', 'USER_MANAGEMENT', userData.id, `Updated employee account ${userData.fullName || userData.email}`);
      return { success: true, message: isRtl ? 'تم تحديث بيانات الموظف بنجاح.' : 'Employee account updated successfully.', user: updated };
    } else {
      const cleanEmail = (userData.email || '').trim().toLowerCase();
      const existing = data.users.find((u: User) => u.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, message: isRtl ? 'البريد الإلكتروني مسجل بالفعل.' : 'Email already exists.' };
      }
      const nextId = (data.users.length > 0 ? Math.max(...data.users.map((u: User) => u.id)) : 0) + 1;
      const role: UserRole = userData.role || 'RECEPTION';
      const fullName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'New Employee';
      const newUser: User = {
        id: nextId,
        username: (userData.username || cleanEmail.split('@')[0] || `user_${nextId}`).toLowerCase(),
        fullName,
        fullNameAr: userData.fullNameAr || fullName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: cleanEmail,
        phoneNumber: userData.phoneNumber || userData.phone || '',
        phone: userData.phoneNumber || userData.phone || '',
        password: userData.password || 'password123',
        role,
        permissions: userData.permissions || getPermissionsForRole(role),
        isActive: userData.isActive !== false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setData((prev: any) => ({
        ...prev,
        users: [...prev.users, newUser],
      }));
      logAudit('USER_CREATE', 'USER_MANAGEMENT', nextId, `Created employee account for ${newUser.fullName} (${newUser.role})`);
      return { success: true, message: isRtl ? 'تمت إضافة الموظف بنجاح.' : 'Employee added successfully.', user: newUser };
    }
  };

  const deleteUser = (userId: number) => {
    if (currentUser.id === userId) {
      return { success: false, message: isRtl ? 'لا يمكنك حذف الحساب المسجل به حالياً.' : 'You cannot delete your own currently logged-in account.' };
    }
    if (data.users.length <= 1) {
      return { success: false, message: isRtl ? 'لا يمكن حذف آخر حساب في النظام.' : 'Cannot delete the only remaining account in the system.' };
    }
    const toDelete = data.users.find((u: User) => u.id === userId);
    setData((prev: any) => ({
      ...prev,
      users: prev.users.filter((u: User) => u.id !== userId),
    }));
    logAudit('USER_DELETE', 'USER_MANAGEMENT', userId, `Deleted employee account: ${toDelete?.fullName || userId}`);
    return { success: true, message: isRtl ? 'تم حذف الحساب بنجاح.' : 'Account deleted successfully.' };
  };

  const deactivateUser = (userId: number) => {
    if (currentUser.id === userId) {
      return { success: false, message: isRtl ? 'لا يمكنك تعطيل الحساب المسجل به حالياً.' : 'You cannot deactivate your own currently logged-in account.' };
    }
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, isActive: !u.isActive } : u),
    }));
    const user = data.users.find((u: User) => u.id === userId);
    const nextStatus = user?.isActive ? 'deactivated' : 'activated';
    logAudit('USER_STATUS_CHANGE', 'USER_MANAGEMENT', userId, `Changed account status to ${nextStatus} for ${user?.fullName}`);
    return { success: true, message: isRtl ? 'تم تحديث حالة الحساب.' : 'Account status updated.' };
  };

  const switchUserRole = (role: UserRole) => {
    const matched = data.users.find((u: User) => u.role === role) || initialUsers.find((u) => u.role === role) || initialUsers[0];
    setCurrentUser(matched);
    logAudit('ROLE_SWITCH', 'USER', matched.id, `Switched active user to ${role} (${matched.fullName})`);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permission);
  };

  const logAudit = (action: string, entityType: string, entityId: number | string, details: string, oldData?: any, newData?: any) => {
    const newLog: AuditLog = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      description: details,
      details,
      oldValues: oldData,
      newValues: newData,
      oldData: oldData ? JSON.stringify(oldData) : undefined,
      newData: newData ? JSON.stringify(newData) : undefined,
      ipAddress: '192.168.1.10',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setData((prev: any) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs],
    }));
  };

  // --- Teacher Actions ---
  const saveTeacher = (teacherData: Partial<Teacher>) => {
    if (!hasPermission('TEACHER_CREATE') && !hasPermission('TEACHER_EDIT')) {
      return { success: false, message: 'Unauthorized: Permission denied to manage teachers.' };
    }
    if (!teacherData.name || teacherData.name.trim() === '') {
      return { success: false, message: 'Teacher name is required.' };
    }

    if (teacherData.id) {
      // Edit existing
      let updatedTeacher: Teacher | undefined;
      setData((prev: any) => {
        const list = prev.teachers.map((item: Teacher) => {
          if (item.id === teacherData.id) {
            updatedTeacher = {
              ...item,
              ...teacherData,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            };
            return updatedTeacher;
          }
          return item;
        });
        return { ...prev, teachers: list };
      });
      logAudit('TEACHER_UPDATE', 'TEACHER', teacherData.id, `Updated teacher ${teacherData.name}`, null, teacherData);
      return { success: true, message: 'Teacher profile updated successfully.', teacher: updatedTeacher };
    } else {
      // Create new with auto sequence
      const nextId = (data.teachers.length > 0 ? Math.max(...data.teachers.map((t: Teacher) => t.id)) : 0) + 1;
      const code = `T${String(nextId).padStart(5, '0')}`;
      const newTeacher: Teacher = {
        id: nextId,
        code,
        name: teacherData.name.trim(),
        phone: teacherData.phone || '',
        email: teacherData.email || '',
        address: teacherData.address || '',
        hireDate: teacherData.hireDate || new Date().toISOString().split('T')[0],
        notes: teacherData.notes || '',
        isActive: teacherData.isActive !== false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setData((prev: any) => ({
        ...prev,
        teachers: [newTeacher, ...prev.teachers],
      }));
      logAudit('TEACHER_CREATE', 'TEACHER', newTeacher.id, `Created teacher ${newTeacher.name} (${newTeacher.code})`, null, newTeacher);
      return { success: true, message: 'Teacher registered successfully.', teacher: newTeacher };
    }
  };

  const deactivateTeacher = (teacherId: number) => {
    if (!hasPermission('TEACHER_DEACTIVATE')) {
      return { success: false, message: 'Unauthorized: Permission denied to deactivate teacher.' };
    }
    setData((prev: any) => ({
      ...prev,
      teachers: prev.teachers.map((t: Teacher) => (t.id === teacherId ? { ...t, isActive: !t.isActive } : t)),
    }));
    logAudit('TEACHER_TOGGLE_STATUS', 'TEACHER', teacherId, `Toggled active status for teacher ID ${teacherId}`);
    return { success: true, message: 'Teacher status updated successfully.' };
  };

  // --- Class Actions with Strict Server-Side Financial Calculation ---
  const saveClass = (classData: {
    id?: number;
    name: string;
    teacherId: number;
    subjectId: number;
    gradeId: number;
    systemId: number;
    lessonPrice: number;
    isActive?: boolean;
    notes?: string;
  }) => {
    if (!hasPermission('CLASS_CREATE') && !hasPermission('CLASS_EDIT')) {
      return { success: false, message: 'Unauthorized: Permission denied to manage classes.' };
    }

    const teacher = data.teachers.find((t: Teacher) => t.id === classData.teacherId);
    const subject = data.subjects.find((s: Subject) => s.id === classData.subjectId);
    const grade = data.grades.find((g: Grade) => g.id === classData.gradeId);
    const system = data.educationSystems.find((sys: EducationSystem) => sys.id === classData.systemId);

    if (!teacher) return { success: false, message: 'Selected teacher not found in registry.' };
    if (!subject) return { success: false, message: 'Selected subject not found.' };
    if (!grade) return { success: false, message: 'Selected grade not found.' };
    if (!system) return { success: false, message: 'Selected education system not found.' };

    const lessonPrice = Number(classData.lessonPrice);
    if (isNaN(lessonPrice) || lessonPrice <= 0) {
      return { success: false, message: 'Lesson price must be greater than zero.' };
    }

    // SERVER-AUTHORITATIVE FINANCIAL CALCULATION
    const centerShare = system.currentCenterShare;
    if (lessonPrice < centerShare) {
      return {
        success: false,
        message: `Lesson price (${lessonPrice} EGP) cannot be less than system center share (${centerShare} EGP).`,
      };
    }
    const teacherShare = lessonPrice - centerShare;

    if (classData.id) {
      // Edit class
      let updatedClass: ClassEntity | undefined;
      setData((prev: any) => {
        const list = prev.classes.map((cls: ClassEntity) => {
          if (cls.id === classData.id) {
            updatedClass = {
              ...cls,
              name: classData.name,
              teacherId: teacher.id,
              teacherName: teacher.name,
              subjectId: subject.id,
              subjectName: subject.nameEn,
              subjectNameAr: subject.nameAr,
              gradeId: grade.id,
              gradeName: grade.nameEn,
              gradeNameAr: grade.nameAr,
              systemId: system.id,
              systemName: system.nameEn,
              systemNameAr: system.nameAr,
              lessonPrice,
              centerShare,
              teacherShare,
              isActive: classData.isActive !== false,
              notes: classData.notes || '',
            };
            return updatedClass;
          }
          return cls;
        });
        return { ...prev, classes: list };
      });
      logAudit('CLASS_UPDATE', 'CLASS', classData.id, `Updated class ${classData.name} (Teacher: ${teacher.name}, Price: ${lessonPrice} EGP, Center: ${centerShare}, Teacher: ${teacherShare})`);
      return { success: true, message: 'Class configuration updated.', classEntity: updatedClass };
    } else {
      // Create new class
      const nextId = (data.classes.length > 0 ? Math.max(...data.classes.map((c: ClassEntity) => c.id)) : 0) + 1;
      const newClass: ClassEntity = {
        id: nextId,
        name: classData.name || `${subject.nameEn} - ${grade.nameEn} (${system.nameEn})`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        subjectId: subject.id,
        subjectName: subject.nameEn,
        subjectNameAr: subject.nameAr,
        gradeId: grade.id,
        gradeName: grade.nameEn,
        gradeNameAr: grade.nameAr,
        systemId: system.id,
        systemName: system.nameEn,
        systemNameAr: system.nameAr,
        lessonPrice,
        centerShare,
        teacherShare,
        isActive: classData.isActive !== false,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        notes: classData.notes || '',
      };
      setData((prev: any) => ({
        ...prev,
        classes: [newClass, ...prev.classes],
      }));
      logAudit('CLASS_CREATE', 'CLASS', newClass.id, `Created class ${newClass.name} (Teacher: ${teacher.name}, Price: ${lessonPrice} EGP, Center: ${centerShare}, Teacher: ${teacherShare})`);
      return { success: true, message: 'Class registered successfully with calculated revenue splits.', classEntity: newClass };
    }
  };

  const deactivateClass = (classId: number) => {
    if (!hasPermission('CLASS_DEACTIVATE')) {
      return { success: false, message: 'Unauthorized: Permission denied to deactivate class.' };
    }
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.map((c: ClassEntity) => (c.id === classId ? { ...c, isActive: !c.isActive } : c)),
    }));
    logAudit('CLASS_TOGGLE_STATUS', 'CLASS', classId, `Toggled active status for class ID ${classId}`);
    return { success: true, message: 'Class status updated.' };
  };

  // --- Student & Enrollment Actions ---
  const saveStudent = (studentData: Partial<Student>) => {
    if (!hasPermission('STUDENT_CREATE') && !hasPermission('STUDENT_EDIT')) {
      return { success: false, message: 'Unauthorized: Permission denied to manage students.' };
    }
    if (!studentData.name || studentData.name.trim() === '') {
      return { success: false, message: 'Student full name is required.' };
    }

    const grade = data.grades.find((g: Grade) => g.id === studentData.gradeId);

    if (studentData.id) {
      let updatedStudent: Student | undefined;
      setData((prev: any) => {
        const list = prev.students.map((s: Student) => {
          if (s.id === studentData.id) {
            updatedStudent = {
              ...s,
              ...studentData,
              gradeName: grade?.nameEn || s.gradeName,
              gradeNameAr: grade?.nameAr || s.gradeNameAr,
            };
            return updatedStudent;
          }
          return s;
        });
        return { ...prev, students: list };
      });
      logAudit('STUDENT_UPDATE', 'STUDENT', studentData.id, `Updated student profile ${studentData.name}`);
      return { success: true, message: 'Student profile updated.', student: updatedStudent };
    } else {
      const nextId = (data.students.length > 0 ? Math.max(...data.students.map((s: Student) => s.id)) : 0) + 1;
      const code = `ST${String(nextId).padStart(6, '0')}`;
      const newStudent: Student = {
        id: nextId,
        code,
        name: studentData.name.trim(),
        phone: studentData.phone || '',
        guardianName: studentData.guardianName || '',
        guardianPhone: studentData.guardianPhone || '',
        address: studentData.address || '',
        birthDate: studentData.birthDate,
        school: studentData.school || '',
        gradeId: studentData.gradeId || 1,
        gradeName: grade?.nameEn || 'Grade 10',
        gradeNameAr: grade?.nameAr || 'الصف العاشر',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: studentData.notes || '',
        isActive: true,
      };
      setData((prev: any) => ({
        ...prev,
        students: [newStudent, ...prev.students],
      }));
      logAudit('STUDENT_CREATE', 'STUDENT', newStudent.id, `Registered student ${newStudent.name} (${newStudent.code})`);
      return { success: true, message: 'Student registered successfully.', student: newStudent };
    }
  };

  const enrollStudent = (studentId: number, classId: number) => {
    if (!hasPermission('ENROLLMENT_MANAGE')) {
      return { success: false, message: 'Unauthorized: Permission denied to manage enrollments.' };
    }

    const student = data.students.find((s: Student) => s.id === studentId);
    const cls = data.classes.find((c: ClassEntity) => c.id === classId);

    if (!student || !cls) return { success: false, message: 'Student or class not found.' };

    const exists = data.enrollments.some(
      (e: Enrollment) => e.studentId === studentId && e.classId === classId && e.isActive
    );
    if (exists) {
      return { success: false, message: 'Student is already actively enrolled in this class.' };
    }

    const nextId = (data.enrollments.length > 0 ? Math.max(...data.enrollments.map((e: Enrollment) => e.id)) : 0) + 1;
    const newEnrollment: Enrollment = {
      id: nextId,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.code,
      classId: cls.id,
      className: cls.name,
      teacherName: cls.teacherName,
      enrollmentDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setData((prev: any) => ({
      ...prev,
      enrollments: [newEnrollment, ...prev.enrollments],
    }));
    logAudit('ENROLLMENT_CREATE', 'ENROLLMENT', newEnrollment.id, `Enrolled ${student.name} in ${cls.name}`);
    return { success: true, message: 'Student enrolled successfully.' };
  };

  // --- Schedule & Sessions ---
  const saveScheduleSlot = (slotData: Partial<ScheduleSlot>) => {
    if (!hasPermission('SCHEDULE_MANAGE')) {
      return { success: false, message: 'Unauthorized: Permission denied to manage schedule.' };
    }
    const cls = data.classes.find((c: ClassEntity) => c.id === slotData.classId);
    const room = data.rooms.find((r: Room) => r.id === slotData.roomId);

    if (!cls || !room) return { success: false, message: 'Invalid class or room selection.' };

    // Collision detection: Check if room or teacher has an overlapping slot
    const conflict = data.scheduleSlots.find((slot: ScheduleSlot) => {
      if (slot.id === slotData.id || !slot.isActive) return false;
      if (slot.dayOfWeek !== slotData.dayOfWeek) return false;

      const sameRoom = slot.roomId === room.id;
      const sameTeacher = slot.teacherId === cls.teacherId;

      if (!sameRoom && !sameTeacher) return false;

      // Time overlap calculation
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      const newStart = slotData.startTime || '10:00';
      const newEnd = slotData.endTime || '12:00';

      const isOverlap = newStart < slotEnd && newEnd > slotStart;
      return isOverlap;
    });

    if (conflict) {
      return {
        success: false,
        message: `Schedule Conflict! ${conflict.roomName} or Teacher is already booked on ${conflict.dayOfWeek} from ${conflict.startTime} to ${conflict.endTime} for ${conflict.className}.`,
      };
    }

    const nextId = (data.scheduleSlots.length > 0 ? Math.max(...data.scheduleSlots.map((s: ScheduleSlot) => s.id)) : 0) + 1;
    const newSlot: ScheduleSlot = {
      id: nextId,
      classId: cls.id,
      className: cls.name,
      teacherId: cls.teacherId,
      teacherName: cls.teacherName,
      subjectName: cls.subjectName,
      gradeName: cls.gradeName,
      systemName: cls.systemName,
      roomId: room.id,
      roomName: room.nameEn,
      roomNameAr: room.nameAr,
      dayOfWeek: slotData.dayOfWeek || 'SATURDAY',
      startTime: slotData.startTime || '10:00',
      endTime: slotData.endTime || '12:00',
      isActive: true,
    };

    setData((prev: any) => ({
      ...prev,
      scheduleSlots: [newSlot, ...prev.scheduleSlots],
    }));
    logAudit('SCHEDULE_CREATE', 'SCHEDULE', newSlot.id, `Scheduled ${cls.name} on ${newSlot.dayOfWeek} in ${room.nameEn}`);
    return { success: true, message: 'Weekly schedule slot created.' };
  };

  const openSession = (classId: number, roomId: number, date: string, startTime: string, endTime: string) => {
    if (!hasPermission('SESSION_MANAGE')) {
      return { success: false, message: 'Unauthorized: Permission denied to create sessions.' };
    }
    const cls = data.classes.find((c: ClassEntity) => c.id === classId);
    const room = data.rooms.find((r: Room) => r.id === roomId);
    if (!cls || !room) return { success: false, message: 'Invalid class or room.' };

    const nextId = (data.sessions.length > 0 ? Math.max(...data.sessions.map((s: ClassSession) => s.id)) : 0) + 1;
    const newSession: ClassSession = {
      id: nextId,
      classId: cls.id,
      className: cls.name,
      teacherId: cls.teacherId,
      teacherName: cls.teacherName || '',
      subjectName: cls.subjectName || '',
      gradeName: cls.gradeName || '',
      systemName: cls.systemName || '',
      roomId: room.id,
      roomName: room.nameEn,
      sessionDate: date,
      startTime,
      endTime,
      status: 'OPEN',
      lessonPrice: cls.lessonPrice,
      centerShare: cls.centerShare,
      teacherShare: cls.teacherShare,
      isSettled: false,
    };

    setData((prev: any) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
    }));
    logAudit('SESSION_OPEN', 'SESSION', newSession.id, `Opened active session for ${cls.name} on ${date}`);
    return { success: true, message: 'Class session opened.', session: newSession };
  };

  // --- ATOMIC "PAY & ATTEND" RECEPTION WORKFLOW ---
  const processPayAndAttend = ({
    studentId,
    sessionId,
    amountPaid,
    paymentMethod,
    attendanceStatus,
    receivedBy,
  }: {
    studentId: number;
    sessionId: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    attendanceStatus: AttendanceStatus;
    receivedBy?: string;
  }) => {
    if (!hasPermission('PAYMENT_CREATE') || !hasPermission('ATTENDANCE_MARK')) {
      return { success: false, message: 'Unauthorized: Reception credentials required to process payments and attendance.' };
    }

    const student = data.students.find((s: Student) => s.id === studentId);
    const session = data.sessions.find((sess: ClassSession) => sess.id === sessionId);

    if (!student || !session) {
      return { success: false, message: 'Student or active session not found.' };
    }

    // Check duplicate attendance/payment
    const alreadyAttended = data.attendance.some(
      (a: AttendanceRecord) => a.sessionId === sessionId && a.studentId === studentId
    );
    if (alreadyAttended) {
      return { success: false, message: 'Duplicate attendance: Student has already attended/paid for this session.' };
    }

    const nextPaymentId = (data.payments.length > 0 ? Math.max(...data.payments.map((p: StudentPayment) => p.id)) : 0) + 1;
    const receiptNumber = `REC-2026-${String(nextPaymentId).padStart(4, '0')}`;
    const cashierName = receivedBy || `${currentUser.fullName} (${currentUser.role})`;

    // SNAPSHOT FINANCIAL VALUES AT TRANSACT TIME
    const newPayment: StudentPayment = {
      id: nextPaymentId,
      receiptNumber,
      studentId: student.id,
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
      amountPaid,
      paymentMethod,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      receivedBy: cashierName,
      isCancelled: false,
    };

    const nextAttendanceId = (data.attendance.length > 0 ? Math.max(...data.attendance.map((a: AttendanceRecord) => a.id)) : 0) + 1;
    const newAttendance: AttendanceRecord = {
      id: nextAttendanceId,
      sessionId: session.id,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.code,
      status: attendanceStatus,
      recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setData((prev: any) => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
      attendance: [newAttendance, ...prev.attendance],
    }));

    logAudit(
      'PAY_AND_ATTEND',
      'PAYMENT',
      receiptNumber,
      `Received ${amountPaid} EGP via ${paymentMethod} from ${student.name} (${student.code}) for session ${session.className}. Marked attendance: ${attendanceStatus}`
    );

    return {
      success: true,
      message: `Payment of ${amountPaid} EGP recorded successfully for ${student.name}.`,
      payment: newPayment,
      receiptNumber,
    };
  };

  // --- TEACHER SETTLEMENT WORKFLOW ---
  const processTeacherSettlement = ({
    teacherId,
    sessionIds,
    deductions = 0,
    deductionNotes,
    paymentMethod,
    notes,
  }: {
    teacherId: number;
    sessionIds: number[];
    deductions: number;
    deductionNotes?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    if (!hasPermission('SETTLEMENT_CREATE')) {
      return { success: false, message: 'Unauthorized: Permission denied to process teacher settlements.' };
    }

    const teacher = data.teachers.find((t: Teacher) => t.id === teacherId);
    if (!teacher) return { success: false, message: 'Teacher not found.' };

    // Fetch matching payments for these sessions
    const relevantPayments = data.payments.filter(
      (p: StudentPayment) => sessionIds.includes(p.sessionId) && !p.isCancelled
    );

    const totalStudents = relevantPayments.length;
    const grossRevenue = relevantPayments.reduce((acc: number, p: StudentPayment) => acc + p.amountPaid, 0);
    const centerShareTotal = relevantPayments.reduce((acc: number, p: StudentPayment) => acc + p.centerShare, 0);
    const teacherGrossTotal = relevantPayments.reduce((acc: number, p: StudentPayment) => acc + p.teacherShare, 0);
    const netPayout = Math.max(0, teacherGrossTotal - deductions);

    const nextSettlementId = (data.settlements.length > 0 ? Math.max(...data.settlements.map((s: TeacherSettlement) => s.id)) : 0) + 1;
    const settlementCode = `STL-2026-${String(nextSettlementId).padStart(4, '0')}`;

    const newSettlement: TeacherSettlement = {
      id: nextSettlementId,
      settlementCode,
      teacherId: teacher.id,
      teacherName: teacher.name,
      settlementDate: new Date().toISOString().split('T')[0],
      sessionIds,
      totalSessions: sessionIds.length,
      totalStudentsAttended: totalStudents,
      grossRevenue,
      centerShareTotal,
      teacherEarningsTotal: teacherGrossTotal,
      deductions,
      deductionNotes,
      netPayout,
      paymentMethod,
      processedBy: `${currentUser.fullName} (${currentUser.role})`,
      status: 'PAID',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes,
    };

    setData((prev: any) => ({
      ...prev,
      settlements: [newSettlement, ...prev.settlements],
      sessions: prev.sessions.map((sess: ClassSession) =>
        sessionIds.includes(sess.id)
          ? { ...sess, isSettled: true, settlementId: newSettlement.id }
          : sess
      ),
    }));

    logAudit(
      'TEACHER_SETTLEMENT',
      'SETTLEMENT',
      settlementCode,
      `Issued payout ${settlementCode} to teacher ${teacher.name}: Net ${netPayout} EGP for ${sessionIds.length} sessions (${totalStudents} students).`
    );

    return {
      success: true,
      message: `Settlement voucher ${settlementCode} issued successfully for ${teacher.name} (${netPayout} EGP).`,
      settlement: newSettlement,
    };
  };

  // --- Expenses ---
  const saveExpense = (expenseData: Partial<ExpenseRecord>) => {
    if (!hasPermission('EXPENSE_MANAGE')) {
      return { success: false, message: 'Unauthorized: Permission denied to manage expenses.' };
    }
    const nextId = (data.expenses.length > 0 ? Math.max(...data.expenses.map((e: ExpenseRecord) => e.id)) : 0) + 1;
    const voucherNumber = `EXP-2026-${String(nextId).padStart(4, '0')}`;
    const newExpense: ExpenseRecord = {
      id: nextId,
      voucherNumber,
      category: expenseData.category || 'MISCELLANEOUS',
      description: expenseData.description || 'Center operational outlay',
      recipientVendor: expenseData.recipientVendor,
      amount: Number(expenseData.amount) || 0,
      expenseDate: expenseData.expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: expenseData.paymentMethod || 'CASH',
      recordedBy: currentUser.fullName,
      approvedBy: 'Dr. Tarek Mansour (CEO)',
      notes: expenseData.notes,
    };

    setData((prev: any) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    logAudit('EXPENSE_RECORD', 'EXPENSE', voucherNumber, `Recorded ${newExpense.amount} EGP expense under ${newExpense.category}`);
    return { success: true, message: 'Expense voucher logged successfully.' };
  };

  const updateSessionStatus = (sessionId: number, status: SessionStatus) => {
    setData((prev: any) => ({
      ...prev,
      sessions: prev.sessions.map((s: ClassSession) =>
        s.id === sessionId ? { ...s, status } : s
      ),
    }));
    logAudit('SESSION_STATUS', 'SESSION', sessionId, `Updated session #${sessionId} status to ${status}`);
    return { success: true, message: `Session status updated to ${status}` };
  };

  // --- System Setup & Effective-Dated Rates ---
  const saveSubject = (subj: Partial<Subject>) => {
    if (!hasPermission('SETUP_EDIT')) return { success: false, message: 'Unauthorized.' };
    if (subj.id) {
      setData((prev: any) => ({
        ...prev,
        subjects: prev.subjects.map((s: Subject) => (s.id === subj.id ? { ...s, ...subj } : s)),
      }));
    } else {
      const nextId = (data.subjects.length > 0 ? Math.max(...data.subjects.map((s: Subject) => s.id)) : 0) + 1;
      const newSubj: Subject = {
        id: nextId,
        nameEn: subj.nameEn || 'New Subject',
        nameAr: subj.nameAr || 'مادة جديدة',
        code: subj.code || `SUB${nextId}`,
        displayOrder: subj.displayOrder || nextId,
        isActive: true,
      };
      setData((prev: any) => ({ ...prev, subjects: [...prev.subjects, newSubj] }));
    }
    return { success: true, message: 'Subject updated.' };
  };

  const saveGrade = (grd: Partial<Grade>) => {
    if (!hasPermission('SETUP_EDIT')) return { success: false, message: 'Unauthorized.' };
    if (grd.id) {
      setData((prev: any) => ({
        ...prev,
        grades: prev.grades.map((g: Grade) => (g.id === grd.id ? { ...g, ...grd } : g)),
      }));
    } else {
      const nextId = (data.grades.length > 0 ? Math.max(...data.grades.map((g: Grade) => g.id)) : 0) + 1;
      const newGrd: Grade = {
        id: nextId,
        nameEn: grd.nameEn || 'New Grade',
        nameAr: grd.nameAr || 'صف جديد',
        code: grd.code || `G${nextId}`,
        displayOrder: grd.displayOrder || nextId,
        isActive: true,
      };
      setData((prev: any) => ({ ...prev, grades: [...prev.grades, newGrd] }));
    }
    return { success: true, message: 'Grade updated.' };
  };

  const saveRoom = (rm: Partial<Room>) => {
    if (!hasPermission('SETUP_EDIT')) return { success: false, message: 'Unauthorized.' };
    if (rm.id) {
      setData((prev: any) => ({
        ...prev,
        rooms: prev.rooms.map((r: Room) => (r.id === rm.id ? { ...r, ...rm } : r)),
      }));
    } else {
      const nextId = (data.rooms.length > 0 ? Math.max(...data.rooms.map((r: Room) => r.id)) : 0) + 1;
      const newRm: Room = {
        id: nextId,
        nameEn: rm.nameEn || 'New Room',
        nameAr: rm.nameAr || 'قاعة جديدة',
        capacity: Number(rm.capacity) || 30,
        floor: rm.floor || '1st Floor',
        notes: rm.notes || '',
        isActive: true,
      };
      setData((prev: any) => ({ ...prev, rooms: [...prev.rooms, newRm] }));
    }
    return { success: true, message: 'Room updated.' };
  };

  const updateEducationSystemRate = (systemId: number, newCenterShare: number, notes?: string) => {
    if (!hasPermission('FINANCIAL_CONFIG_EDIT')) {
      return { success: false, message: 'Unauthorized: Permission denied to modify financial rates.' };
    }

    const system = data.educationSystems.find((sys: EducationSystem) => sys.id === systemId);
    if (!system) return { success: false, message: 'System not found.' };

    const todayDate = new Date().toISOString().split('T')[0];
    const nextRateId = Date.now();

    const newRateRecord = {
      id: nextRateId,
      systemId,
      centerShare: Number(newCenterShare),
      effectiveFrom: todayDate,
      effectiveTo: null,
      isActive: true,
      notes: notes || `Rate adjusted to ${newCenterShare} EGP`,
      createdBy: currentUser.fullName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setData((prev: any) => ({
      ...prev,
      educationSystems: prev.educationSystems.map((sys: EducationSystem) => {
        if (sys.id === systemId) {
          const updatedHistory = sys.rateHistory.map((r) =>
            r.effectiveTo === null ? { ...r, effectiveTo: todayDate, isActive: false } : r
          );
          return {
            ...sys,
            currentCenterShare: Number(newCenterShare),
            rateHistory: [newRateRecord, ...updatedHistory],
          };
        }
        return sys;
      }),
    }));

    logAudit(
      'RATE_VERSION_UPDATE',
      'FINANCIAL_CONFIG',
      system.nameEn,
      `Adjusted Center Share for ${system.nameEn} from ${system.currentCenterShare} EGP to ${newCenterShare} EGP. Effective from ${todayDate}.`
    );

    return { success: true, message: 'Rate updated with historical effective-dated versioning.' };
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
    });
    logAudit('RESET_DATABASE', 'SYSTEM', 'ALL', 'Reset all tables to initial demonstration state.');
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

        saveTeacher,
        deactivateTeacher,
        saveClass,
        deactivateClass,
        saveStudent,
        enrollStudent,
        saveScheduleSlot,
        openSession,
        createSession: openSession,
        updateSessionStatus,
        processPayAndAttend,
        processTeacherSettlement,
        saveExpense,
        recordExpense: saveExpense,
        saveSubject,
        saveGrade,
        saveRoom,
        updateEducationSystemRate,

        // Auth & Employee Actions
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
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
