import { BurndownPoint, MonthlyStats, TimeRecord } from '../types';
import { calculateDuration, getJSTDateString } from './formatters';

export const getMonthKey = (date: Date = new Date()): string => getJSTDateString(date).slice(0, 7);

export const getMonthDateStrings = (month: string): string[] => {
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  return Array.from(
    { length: daysInMonth },
    (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`
  );
};

const recordsForMonth = (records: TimeRecord[], month: string): TimeRecord[] =>
  records.filter(record => record.date.startsWith(month));

export const calculateMonthlyStats = (
  records: TimeRecord[],
  contractHours: number,
  activeSession: TimeRecord | null | undefined,
  currentTime: string,
  month: string = getMonthKey()
): MonthlyStats => {
  const monthRecords = recordsForMonth(records, month);
  const completedRecords = monthRecords.filter(record => record.clockOut !== null);
  const completedMinutes = completedRecords.reduce(
    (sum, record) => sum + (calculateDuration(record.clockIn, record.clockOut) || 0),
    0
  );
  const activeMinutes = activeSession?.date.startsWith(month)
    ? calculateDuration(activeSession.clockIn, currentTime) || 0
    : 0;
  const workedDays = new Set(completedRecords.map(record => record.date));

  if (activeSession?.date.startsWith(month)) {
    workedDays.add(activeSession.date);
  }

  const totalHours = (completedMinutes + activeMinutes) / 60;
  const daysWorked = workedDays.size;

  return {
    totalHours,
    contractHours,
    remainingHours: Math.max(0, contractHours - totalHours),
    daysWorked,
    averageHoursPerDay: daysWorked > 0 ? totalHours / daysWorked : 0
  };
};

export const buildBurndownPoints = (
  records: TimeRecord[],
  contractHours: number,
  activeSession: TimeRecord | null | undefined,
  currentTime: string,
  month: string
): BurndownPoint[] => {
  const dates = getMonthDateStrings(month);
  const minutesByDate = new Map<string, number>();

  recordsForMonth(records, month)
    .filter(record => record.clockOut !== null)
    .forEach(record => {
      const duration = calculateDuration(record.clockIn, record.clockOut) || 0;
      minutesByDate.set(record.date, (minutesByDate.get(record.date) || 0) + duration);
    });

  if (activeSession?.date.startsWith(month)) {
    const duration = calculateDuration(activeSession.clockIn, currentTime) || 0;
    minutesByDate.set(
      activeSession.date,
      (minutesByDate.get(activeSession.date) || 0) + duration
    );
  }

  const contractMinutes = contractHours * 60;
  let workedMinutes = 0;

  return dates.map((date, index) => {
    workedMinutes += minutesByDate.get(date) || 0;
    const progress = dates.length === 1 ? 1 : index / (dates.length - 1);

    return {
      date,
      remainingMinutes: Math.max(0, contractMinutes - workedMinutes),
      idealRemainingMinutes: contractMinutes * (1 - progress)
    };
  });
};
