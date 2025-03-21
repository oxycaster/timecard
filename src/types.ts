export interface TimeRecord {
  id: string;
  clockIn: string;
  clockOut: string | null;
  date: string;
}

export interface DailySession {
  id: string;
  clockIn: string;
  clockOut: string | null;
  duration: number | null; // in minutes
}

export interface MonthlyStats {
  totalHours: number;
  contractHours: number;
  remainingHours: number;
  daysWorked: number;
  averageHoursPerDay: number;
}

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  clockInMessage: string;
  clockOutMessage: string;
}
