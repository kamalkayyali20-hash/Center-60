import {
  Student,
  Teacher,
  ClassEntity,
  ClassSession,
  Enrollment,
  AttendanceRecord,
  CrossCenterTeacherBooking,
} from '../types';

/**
 * Normalizes Egyptian phone numbers into a standard comparable format (+201xxxxxxxxx).
 * Supports:
 * - 01012345678 -> +201012345678
 * - +201012345678 -> +201012345678
 * - 00201012345678 -> +201012345678
 * - 201012345678 -> +201012345678
 * - 010 1234 5678 -> +201012345678
 */
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return '';
  // Remove all spaces, dashes, parentheses, dots
  let cleaned = phone.replace(/[\s\-().]/g, '');

  if (cleaned.startsWith('0020')) {
    cleaned = '+20' + cleaned.substring(4);
  } else if (cleaned.startsWith('20') && cleaned.length >= 12) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '+20' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+') && cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '+20' + cleaned;
  }

  return cleaned;
}

export function arePhonesEqual(phone1?: string, phone2?: string): boolean {
  if (!phone1 || !phone2) return false;
  return normalizeEgyptianPhone(phone1) === normalizeEgyptianPhone(phone2);
}

export interface StudentDuplicateCheckResult {
  outcome: 'CASE_A_NEW' | 'CASE_B_GLOBAL_EXISTS' | 'CASE_C_LOCAL_EXISTS' | 'CASE_D_CONFLICT';
  message: string;
  foundStudent?: Student;
}

/**
 * Validates student duplicate against local center and global KAYEDU network.
 */
export function checkStudentDuplicate(
  phone: string,
  email: string | undefined,
  localStudents: Student[],
  globalStudents: Student[],
  currentStudentId?: number
): StudentDuplicateCheckResult {
  const normPhone = normalizeEgyptianPhone(phone);
  const normEmail = email?.trim().toLowerCase();

  // 1. Check if already exists in this center
  const localMatch = localStudents.find((s) => {
    if (currentStudentId && (s.id === currentStudentId || s.centerId === currentStudentId)) return false;
    const phoneMatch = arePhonesEqual(s.phone, normPhone);
    const emailMatch = normEmail && s.email && s.email.toLowerCase() === normEmail;
    return phoneMatch || emailMatch;
  });

  if (localMatch && localMatch.isCenterConnected !== false) {
    return {
      outcome: 'CASE_C_LOCAL_EXISTS',
      message: 'This student is already registered at this center.',
      foundStudent: localMatch,
    };
  }

  // 2. Check if exists in global KAYEDU registry but not connected to this center
  const globalMatch = globalStudents.find((s) => {
    if (currentStudentId && (s.id === currentStudentId || s.centerId === currentStudentId)) return false;
    const phoneMatch = arePhonesEqual(s.phone, normPhone);
    const emailMatch = normEmail && s.email && s.email.toLowerCase() === normEmail;
    return phoneMatch || emailMatch;
  });

  if (globalMatch) {
    return {
      outcome: 'CASE_B_GLOBAL_EXISTS',
      message: 'Existing student account found in KAYEDU registry.',
      foundStudent: globalMatch,
    };
  }

  return {
    outcome: 'CASE_A_NEW',
    message: 'No duplicate found. Student account can be created.',
  };
}

export interface TeacherDuplicateCheckResult {
  outcome: 'CASE_A_NEW' | 'CASE_B_GLOBAL_EXISTS' | 'CASE_C_LOCAL_EXISTS' | 'CASE_D_CONFLICT';
  message: string;
  foundTeacher?: Teacher;
}

/**
 * Validates teacher duplicate against local center and global KAYEDU network.
 */
export function checkTeacherDuplicate(
  phone: string,
  email: string | undefined,
  localTeachers: Teacher[],
  globalTeachers: Teacher[],
  currentTeacherId?: number
): TeacherDuplicateCheckResult {
  const normPhone = normalizeEgyptianPhone(phone);
  const normEmail = email?.trim().toLowerCase();

  const localMatch = localTeachers.find((t) => {
    if (currentTeacherId && t.id === currentTeacherId) return false;
    const phoneMatch = arePhonesEqual(t.phone, normPhone);
    const emailMatch = normEmail && t.email && t.email.toLowerCase() === normEmail;
    return phoneMatch || emailMatch;
  });

  if (localMatch && localMatch.isCenterConnected !== false) {
    return {
      outcome: 'CASE_C_LOCAL_EXISTS',
      message: 'This teacher is already registered and active at this center.',
      foundTeacher: localMatch,
    };
  }

  const globalMatch = globalTeachers.find((t) => {
    if (currentTeacherId && t.id === currentTeacherId) return false;
    const phoneMatch = arePhonesEqual(t.phone, normPhone);
    const emailMatch = normEmail && t.email && t.email.toLowerCase() === normEmail;
    return phoneMatch || emailMatch;
  });

  if (globalMatch) {
    return {
      outcome: 'CASE_B_GLOBAL_EXISTS',
      message: 'Existing teacher profile found in KAYEDU network.',
      foundTeacher: globalMatch,
    };
  }

  return {
    outcome: 'CASE_A_NEW',
    message: 'Teacher is new. Profile can be created.',
  };
}

/**
 * Helper to convert "HH:mm" time string into minutes from 00:00
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

/**
 * Validates whether two time intervals overlap.
 * start1 < end2 && start2 < end1
 */
export function doTimesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Room Conflict Validation: Checks if the room is already booked on that date and time.
 */
export function validateRoomConflict(
  sessions: ClassSession[],
  roomId: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: number
): { hasConflict: boolean; conflictingSession?: ClassSession; message?: string } {
  const conflict = sessions.find((sess) => {
    if (excludeSessionId && sess.id === excludeSessionId) return false;
    if (sess.status === 'CANCELLED') return false;
    if (sess.roomId !== roomId) return false;
    if (sess.sessionDate !== date) return false;

    return doTimesOverlap(sess.startTime, sess.endTime, startTime, endTime);
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictingSession: conflict,
      message: `Room conflict: ${conflict.roomName || `Room #${roomId}`} is already occupied from ${conflict.startTime} to ${conflict.endTime} (${conflict.className}).`,
    };
  }

  return { hasConflict: false };
}

/**
 * Teacher Conflict Validation:
 * - Local Center: Checks if teacher already has an overlapping session.
 * - Cross-Center: Checks if teacher is booked at another center (privacy preserved!).
 */
export function validateTeacherConflict(
  sessions: ClassSession[],
  crossCenterBookings: CrossCenterTeacherBooking[],
  teacherId: number,
  teacherName: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: number
): { hasConflict: boolean; conflictingSession?: ClassSession; message?: string; isCrossCenter?: boolean } {
  // 1. Local conflict
  const localConflict = sessions.find((sess) => {
    if (excludeSessionId && sess.id === excludeSessionId) return false;
    if (sess.status === 'CANCELLED') return false;
    if (sess.teacherId !== teacherId) return false;
    if (sess.sessionDate !== date) return false;

    return doTimesOverlap(sess.startTime, sess.endTime, startTime, endTime);
  });

  if (localConflict) {
    return {
      hasConflict: true,
      conflictingSession: localConflict,
      message: `Teacher schedule conflict. ${teacherName || localConflict.teacherName} already has a session from ${localConflict.startTime} to ${localConflict.endTime} (${localConflict.className}).`,
    };
  }

  // 2. Cross-center conflict (Do NOT expose private center details!)
  const crossConflict = crossCenterBookings.find((b) => {
    if (b.teacherId !== teacherId) return false;
    if (b.date !== date) return false;

    return doTimesOverlap(b.startTime, b.endTime, startTime, endTime);
  });

  if (crossConflict) {
    return {
      hasConflict: true,
      isCrossCenter: true,
      message: 'Teacher schedule conflict: Teacher is unavailable during this time slot.',
    };
  }

  return { hasConflict: false };
}

/**
 * Student Schedule Conflict: Checks if student already has another confirmed session at the same time.
 */
export function validateStudentScheduleConflict(
  studentId: number,
  date: string,
  startTime: string,
  endTime: string,
  attendances: AttendanceRecord[],
  sessions: ClassSession[],
  excludeSessionId?: number
): { hasConflict: boolean; conflictingSession?: ClassSession; message?: string } {
  const studentAttendedSessionIds = attendances
    .filter((a) => a.studentId === studentId && (a.status === 'PRESENT' || a.status === 'LATE'))
    .map((a) => a.sessionId);

  const conflict = sessions.find((sess) => {
    if (excludeSessionId && sess.id === excludeSessionId) return false;
    if (sess.status === 'CANCELLED') return false;
    if (!studentAttendedSessionIds.includes(sess.id)) return false;
    if (sess.sessionDate !== date) return false;

    return doTimesOverlap(sess.startTime, sess.endTime, startTime, endTime);
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictingSession: conflict,
      message: `Student schedule conflict: Student already has another confirmed class (${conflict.className}) from ${conflict.startTime} to ${conflict.endTime}.`,
    };
  }

  return { hasConflict: false };
}

/**
 * Capacity validation: Checks if class is full or if capacity reduction is valid.
 */
export function validateClassCapacity(
  cls: ClassEntity,
  enrollments: Enrollment[],
  proposedNewCapacity?: number
): { canEnroll: boolean; isFull: boolean; enrolledCount: number; maxCapacity: number; message?: string } {
  const activeEnrollments = enrollments.filter((e) => e.classId === cls.id && e.isActive);
  const enrolledCount = activeEnrollments.length;
  const maxCapacity = cls.maxCapacity || 30;

  if (proposedNewCapacity !== undefined) {
    if (proposedNewCapacity < enrolledCount) {
      return {
        canEnroll: false,
        isFull: true,
        enrolledCount,
        maxCapacity,
        message: `Cannot reduce capacity to ${proposedNewCapacity}. Current active enrollment is ${enrolledCount}.`,
      };
    }
  }

  const isFull = enrolledCount >= maxCapacity;

  return {
    canEnroll: !isFull,
    isFull,
    enrolledCount,
    maxCapacity,
    message: isFull ? `Class has reached maximum capacity (${maxCapacity} students).` : undefined,
  };
}

/**
 * Teacher Academic Eligibility: Checks if teacher is configured to teach the specific grade & education system.
 */
export function validateTeacherAcademicEligibility(
  teacher: Teacher,
  gradeId: number,
  systemId: number,
  gradeName?: string,
  systemName?: string
): { isEligible: boolean; message?: string } {
  if (teacher.gradeIds && teacher.gradeIds.length > 0 && !teacher.gradeIds.includes(gradeId)) {
    return {
      isEligible: false,
      message: `Academic mismatch: ${teacher.name} is not configured to teach ${gradeName || `Grade #${gradeId}`}.`,
    };
  }

  if (teacher.systemIds && teacher.systemIds.length > 0 && !teacher.systemIds.includes(systemId)) {
    return {
      isEligible: false,
      message: `Academic mismatch: ${teacher.name} is not configured to teach ${systemName || `System #${systemId}`}.`,
    };
  }

  return { isEligible: true };
}

/**
 * Price split validation.
 */
export function validatePriceSplit(
  lessonPrice: number,
  centerShare: number
): { isValid: boolean; teacherShare: number; message?: string } {
  if (lessonPrice < centerShare) {
    return {
      isValid: false,
      teacherShare: 0,
      message: `Invalid pricing: Lesson price (${lessonPrice} EGP) cannot be less than Center Share (${centerShare} EGP).`,
    };
  }

  return {
    isValid: true,
    teacherShare: lessonPrice - centerShare,
  };
}

/**
 * Validates recurring class room conflict across all classes' scheduleDays.
 */
export function validateClassScheduleSlotRoomConflict(
  classes: ClassEntity[],
  roomId: number,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  excludeClassId?: number
): { hasConflict: boolean; conflictingClass?: ClassEntity; message?: string } {
  for (const cls of classes) {
    if (!cls.isActive) continue;
    if (excludeClassId && cls.id === excludeClassId) continue;
    if (!cls.scheduleDays) continue;

    for (const slot of cls.scheduleDays) {
      if (slot.roomId === roomId && slot.dayOfWeek === dayOfWeek) {
        if (doTimesOverlap(slot.startTime, slot.endTime, startTime, endTime)) {
          return {
            hasConflict: true,
            conflictingClass: cls,
            message: `Room conflict: Room is already reserved for class "${cls.name}" on ${dayOfWeek} from ${slot.startTime} to ${slot.endTime}.`,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Validates recurring teacher schedule conflict across all classes' scheduleDays and cross-center bookings.
 */
export function validateClassScheduleSlotTeacherConflict(
  classes: ClassEntity[],
  crossCenterBookings: CrossCenterTeacherBooking[],
  teacherId: number,
  teacherName: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  excludeClassId?: number
): { hasConflict: boolean; conflictingClass?: ClassEntity; message?: string; isCrossCenter?: boolean } {
  // 1. Local class schedules
  for (const cls of classes) {
    if (!cls.isActive) continue;
    if (excludeClassId && cls.id === excludeClassId) continue;
    if (cls.teacherId !== teacherId) continue;
    if (!cls.scheduleDays) continue;

    for (const slot of cls.scheduleDays) {
      if (slot.dayOfWeek === dayOfWeek) {
        if (doTimesOverlap(slot.startTime, slot.endTime, startTime, endTime)) {
          return {
            hasConflict: true,
            conflictingClass: cls,
            message: `Teacher conflict: ${teacherName || cls.teacherName} is already scheduled for class "${cls.name}" on ${dayOfWeek} from ${slot.startTime} to ${slot.endTime}.`,
          };
        }
      }
    }
  }

  // 2. Cross-center bookings
  const crossMatch = crossCenterBookings.find((b) => {
    if (b.teacherId !== teacherId) return false;
    // Cross center booking check
    return doTimesOverlap(b.startTime, b.endTime, startTime, endTime);
  });

  if (crossMatch) {
    return {
      hasConflict: true,
      isCrossCenter: true,
      message: `Teacher conflict: ${teacherName} is unavailable during this time slot (partner center commitment).`,
    };
  }

  return { hasConflict: false };
}

/**
 * Validates student conflict when enrolling in a class with recurring schedule.
 */
export function validateStudentClassEnrollmentScheduleConflict(
  studentId: number,
  newClass: ClassEntity,
  classes: ClassEntity[],
  enrollments: Enrollment[]
): { hasConflict: boolean; conflictingClass?: ClassEntity; message?: string } {
  const activeEnrolledClassIds = enrollments
    .filter((e) => (e.studentId === studentId) && e.isActive && e.classId !== newClass.id)
    .map((e) => e.classId);

  const activeClasses = classes.filter((c) => activeEnrolledClassIds.includes(c.id) && c.isActive);

  if (!newClass.scheduleDays || newClass.scheduleDays.length === 0) {
    return { hasConflict: false };
  }

  for (const newSlot of newClass.scheduleDays) {
    for (const enrolledCls of activeClasses) {
      if (!enrolledCls.scheduleDays) continue;
      for (const enrolledSlot of enrolledCls.scheduleDays) {
        if (enrolledSlot.dayOfWeek === newSlot.dayOfWeek) {
          if (doTimesOverlap(enrolledSlot.startTime, enrolledSlot.endTime, newSlot.startTime, newSlot.endTime)) {
            return {
              hasConflict: true,
              conflictingClass: enrolledCls,
              message: `Student schedule overlap: Student is already enrolled in "${enrolledCls.name}" on ${newSlot.dayOfWeek} (${enrolledSlot.startTime} - ${enrolledSlot.endTime}).`,
            };
          }
        }
      }
    }
  }

  return { hasConflict: false };
}

