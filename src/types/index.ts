export type Language = 'en' | 'ar';

export type UserRole = 'CEO' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'RECEPTION' | 'TEACHER';

export type Permission =
  | 'TEACHER_VIEW'
  | 'TEACHER_CREATE'
  | 'TEACHER_EDIT'
  | 'TEACHER_DEACTIVATE'
  | 'CLASS_VIEW'
  | 'CLASS_CREATE'
  | 'CLASS_EDIT'
  | 'CLASS_DEACTIVATE'
  | 'STUDENT_VIEW'
  | 'STUDENT_CREATE'
  | 'STUDENT_EDIT'
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
  password?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface Subject {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Grade {
  id: number;
  nameEn: string;
  nameAr: string;
  code: string;
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
  capacity: number;
  floor: string;
  notes?: string;
  isActive: boolean;
}

export interface Teacher {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  hireDate: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  isActive: boolean;
  createdAt: string;
  notes?: string;
}

export interface Student {
  id: number;
  code: string; // ST000001
  name: string;
  phone: string;
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
  notes?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type PaymentMethod = 'CASH' | 'VODAFONE_CASH' | 'INSTAPAY' | 'CREDIT_CARD';

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
  | 'authPage';

export type SessionEntity = ClassSession;

export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'PRINTING_SUPPLIES'
  | 'MAINTENANCE'
  | 'STAFF_SALARY'
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
