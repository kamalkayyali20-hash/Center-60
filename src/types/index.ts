export type Language = 'en' | 'ar';

export type UserRole = 'CEO' | 'ADMIN' | 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'RECEPTION' | 'TEACHER' | 'STUDENT';

export type Permission =
  | 'TEACHER_VIEW'
  | 'TEACHER_CREATE'
  | 'TEACHER_EDIT'
  | 'TEACHER_DEACTIVATE'
  | 'TEACHER_DELETE'
  | 'CLASS_VIEW'
  | 'CLASS_CREATE'
  | 'CLASS_EDIT'
  | 'CLASS_DEACTIVATE'
  | 'STUDENT_VIEW'
  | 'STUDENT_CREATE'
  | 'STUDENT_EDIT'
  | 'STUDENT_DELETE'
  | 'STUDENT_GRADE_PROMOTE'
  | 'ENROLLMENT_MANAGE'
  | 'SCHEDULE_VIEW'
  | 'SCHEDULE_MANAGE'
  | 'SESSION_MANAGE'
  | 'ATTENDANCE_MARK'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_VIEW'
  | 'PAYMENT_CANCEL'
  | 'SETTLEMENT_VIEW'
  | 'SETTLEMENT_CREATE'
  | 'SETTLEMENT_APPROVE'
  | 'EXPENSE_MANAGE'
  | 'SETUP_VIEW'
  | 'SETUP_EDIT'
  | 'FINANCIAL_CONFIG_EDIT'
  | 'USER_ADMIN'
  | 'AUDIT_VIEW'
  | 'REPORT_OPERATIONAL'
  | 'REPORT_FINANCIAL'
  | 'CEO_DASHBOARD';

export interface User {
  id: number;
  username: string;
  fullName: string;
  fullNameAr?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  altPhone?: string;
  password?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt?: string;
  teacherId?: number;
  studentId?: number;
  assignedCenterIds?: number[];
  isEmailConfirmed?: boolean;
  isPhoneConfirmed?: boolean;
}

export interface Subject {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
  gradeId?: number;
  displayOrder: number;
  isActive: boolean;
}

export interface Grade {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
  educationalType?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface EducationSystemRate {
  id: number;
  systemId: number;
  centerShare: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface EducationSystem {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
  currentCenterShare: number;
  isActive: boolean;
  rateHistory: EducationSystemRate[];
}

export interface Room {
  id: number;
  nameEn: string;
  nameAr: string;
  capacity: number; // Students quantity
  floor: string;
  notes?: string;
  isActive: boolean;
}

export interface Teacher {
  id: number;
  code: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone: string;
  altPhone?: string;
  email: string;
  address: string;
  hireDate: string;
  notes: string;
  isActive: boolean;
  lastSessionCompletedDate?: string;
  assignedCenterIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export type ClassAcceptanceMode = 'OPEN' | 'CONFIRMATION_REQUIRED';

export interface ClassScheduleDay {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  roomId: number;
}

export interface ClassEntity {
  id: number;
  name: string;
  teacherId: number;
  teacherName?: string;
  subjectId: number;
  subjectName?: string;
  subjectNameAr?: string;
  gradeId: number;
  gradeName?: string;
  gradeNameAr?: string;
  systemId: number;
  systemName?: string;
  systemNameAr?: string;
  lessonPrice: number;
  centerShare: number;
  teacherShare: number;
  educationalType?: string;
  maxCapacity?: number;
  lessonDurationMinutes?: number;
  scheduleDays?: ClassScheduleDay[];
  acceptanceMode?: ClassAcceptanceMode;
  isActive: boolean;
  createdAt: string;
  notes?: string;
}

export interface Student {
  id: number; // Center ID (starts at 100 and increments by 1)
  centerId: number; // Center ID (e.g. 100, 101, 102)
  uuid: string; // Globally Unique UUID
  code: string; // ST000100
  firstName?: string;
  lastName?: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
  parentAltPhone?: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  birthDate?: string;
  school: string;
  gradeId: number;
  gradeName?: string;
  gradeNameAr?: string;
  registrationDate: string;
  notes?: string;
  isActive: boolean;
  assignedTeacherIds?: number[];
  assignedSubjectIds?: number[];
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName?: string;
  studentCode?: string;
  classId: number;
  className?: string;
  teacherName?: string;
  enrollmentDate: string;
  isActive: boolean;
  isOneTimeSession?: boolean;
  status?: 'PENDING_CONFIRMATION' | 'ENROLLED' | 'REJECTED';
  discountPercentage?: number;
}

export type DayOfWeek = 'SATURDAY' | 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface ScheduleSlot {
  id: number;
  classId: number;
  className?: string;
  teacherId: number;
  teacherName?: string;
  subjectName?: string;
  gradeName?: string;
  systemName?: string;
  roomId: number;
  roomName?: string;
  roomNameAr?: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isActive: boolean;
}

export type SessionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SessionFile {
  id: string;
  sessionId: number;
  name: string;
  size: string;
  type: string; // 'pdf' | 'doc' | 'image' | 'sheet' | 'zip'
  url: string;
  uploadDate: string;
  uploadedBy: string;
  uploadedByRole?: UserRole;
  downloadCount?: number;
}

export interface ClassSession {
  id: number;
  classId: number;
  className: string;
  teacherId: number;
  teacherName: string;
  subjectName: string;
  gradeName: string;
  systemName: string;
  roomId: number;
  roomName: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: SessionStatus;
  lessonPrice: number;
  centerShare: number;
  teacherShare: number;
  isSettled: boolean;
  settlementId?: number;
  files?: SessionFile[];
  notes?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type PaymentMethod = 'CASH' | 'INSTAPAY' | 'VODAFONE_CASH' | 'CREDIT_CARD';

export interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  recordedAt: string;
  notes?: string;
}

export interface StudentPayment {
  id: number;
  receiptNumber: string; // REC-2026-0001
  studentId: number;
  studentName: string;
  studentCode: string;
  sessionId: number;
  classId: number;
  className: string;
  teacherId: number;
  teacherName: string;
  lessonPrice: number;
  centerShare: number;
  teacherShare: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receivedBy: string;
  isCancelled: boolean;
  cancellationReason?: string;
}

export interface TeacherSettlement {
  id: number;
  settlementCode: string; // STL-2026-0001
  teacherId: number;
  teacherName: string;
  settlementDate: string;
  sessionIds: number[];
  totalSessions: number;
  totalStudentsAttended: number;
  grossRevenue: number;
  centerShareTotal: number;
  teacherEarningsTotal: number;
  deductions: number;
  deductionNotes?: string;
  netPayout: number;
  paymentMethod: PaymentMethod;
  processedBy: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  paidAt?: string;
  notes?: string;
}

export type NavView =
  | 'teachersDashboard'
  | 'classesDashboard'
  | 'teacherClass'
  | 'systemSetup'
  | 'receptionDesk'
  | 'teacherSettlements'
  | 'studentsEnrollment'
  | 'classSchedules'
  | 'sessionDetail'
  | 'expensesManager'
  | 'dashboard'
  | 'reportsCenter'
  | 'auditTrail'
  | 'authPage'
  | 'usersAndRoles'
  | 'teacherFiles'
  | 'studentSessions'
  | 'studentClasses'
  | 'studentCard';

export type SessionEntity = ClassSession;

export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'PRINTING_SUPPLIES'
  | 'MAINTENANCE'
  | 'STAFF_SALARY'
  | 'HOSPITALITY'
  | 'MARKETING'
  | 'MISCELLANEOUS';

export interface ExpenseRecord {
  id: number;
  voucherNumber: string;
  category: ExpenseCategory;
  description: string;
  recipientVendor?: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: number | string;
  description: string;
  details?: string;
  oldValues?: any;
  newValues?: any;
  oldData?: string;
  newData?: string;
  ipAddress: string;
  timestamp: string;
}

// System Configurations
export interface TeacherTimeoutConfig {
  enabled: boolean;
  timeoutDays: number; // e.g. 30 days of inactivity
}

export interface CardCustomizationConfig {
  showName: boolean;
  showCenterId: boolean;
  showUuid: boolean;
  showGrade: boolean;
  showQrCode: boolean;
  showBarcode: boolean;
  showCenterLogo: boolean;
  showPhone: boolean;
  showParentPhone: boolean;
  showSchool: boolean;
  themeColor: string; // e.g. '#0891b2'
  cardLayout: 'horizontal' | 'vertical';
  logoPosition: 'top-left' | 'top-right' | 'center';
  centerName: string;
}

export interface ManagerDueConfig {
  teacherEditDeadlineHours: number; // e.g. 24 hours before/after
  canTeacherAddSession: boolean;
  canTeacherCancelSession: boolean;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  token: string;
}

