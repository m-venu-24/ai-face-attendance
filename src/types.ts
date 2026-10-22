export interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  time: string;
  timestamp: number;
  confidence?: number;
  status: 'Verified' | 'Late' | 'Manual';
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  samplesCount: number;
  registeredAt: string;
  descriptors?: number[][];
}

export interface AttendanceSummary {
  totalEntries: number;
  todayDate: string;
  todayCount: number;
  uniqueTodayPersons: number;
  registeredCount: number;
  attendanceRate: number;
  latest: AttendanceRecord | null;
}

export interface NotificationLog {
  id: string;
  type: 'EMAIL' | 'SMS';
  recipient: string;
  recipientType: 'Admin' | 'User';
  subject?: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Failed';
}

export interface SystemSettings {
  tolerance: number;
  scaleFactor: number;
  enableNotifications: boolean;
  adminEmail: string;
  adminPhone: string;
  allowMultipleDailyMarks: boolean;
}
