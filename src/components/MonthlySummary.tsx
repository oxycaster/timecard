import { useEffect, useState } from 'react';
import { TimeRecord, MonthlyStats } from '../types';
import { isCurrentMonth, calculateDuration, formatDuration, toJSTDate, getJSTISOString } from '../utils/formatters';

interface MonthlySummaryProps {
  records: TimeRecord[];
  contractHours: number;
  activeSession?: TimeRecord | null;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ records, contractHours, activeSession }) => {
  const [stats, setStats] = useState<MonthlyStats>({
    totalHours: 0,
    contractHours,
    remainingHours: contractHours,
    daysWorked: 0,
    averageHoursPerDay: 0
  });
  const [currentTime, setCurrentTime] = useState<string>(getJSTISOString());

  // Update current time every second when there's an active session
  useEffect(() => {
    if (!activeSession) return;

    const timer = setInterval(() => {
      setCurrentTime(getJSTISOString());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [activeSession]);

  useEffect(() => {
    // Filter records for current month
    const monthRecords = records.filter(record => isCurrentMonth(record.date));

    // Only count completed sessions
    const completedRecords = monthRecords.filter(record => record.clockOut !== null);

    // Calculate total minutes from completed sessions
    const completedMinutes = completedRecords.reduce((sum, record) => {
      const duration = calculateDuration(record.clockIn, record.clockOut);
      return sum + (duration || 0);
    }, 0);

    // Calculate minutes from active session if it exists and is in the current month
    let activeMinutes = 0;
    if (activeSession && isCurrentMonth(activeSession.date)) {
      const activeDuration = calculateDuration(activeSession.clockIn, currentTime);
      activeMinutes = activeDuration || 0;
    }

    // Total minutes is the sum of completed and active minutes
    const totalMinutes = completedMinutes + activeMinutes;

    // Convert to hours
    const totalHours = totalMinutes / 60;

    // Get unique days worked
    const uniqueDays = new Set();
    completedRecords.forEach(record => {
      const date = toJSTDate(record.date).toLocaleDateString();
      uniqueDays.add(date);
    });

    // Add active session day if it exists and is in the current month
    if (activeSession && isCurrentMonth(activeSession.date)) {
      const date = toJSTDate(activeSession.date).toLocaleDateString();
      uniqueDays.add(date);
    }

    const daysWorked = uniqueDays.size;

    // Calculate average hours per day
    const averageHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

    // Calculate remaining hours
    const remainingHours = Math.max(0, contractHours - totalHours);

    setStats({
      totalHours,
      contractHours,
      remainingHours,
      daysWorked,
      averageHoursPerDay
    });
  }, [records, contractHours, activeSession, currentTime]);

  return (
    <div className="monthly-summary">
      <h3>今月の勤務サマリー</h3>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="label">合計時間</div>
          <div className="value">{formatDuration(Math.round(stats.totalHours * 60))}</div>
        </div>
        <div className="summary-item">
          <div className="label">契約時間</div>
          <div className="value">{formatDuration(Math.round(stats.contractHours * 60))}</div>
        </div>
        <div className="summary-item">
          <div className="label">残り時間</div>
          <div className="value">{formatDuration(Math.round(stats.remainingHours * 60))}</div>
        </div>
        <div className="summary-item">
          <div className="label">勤務日数</div>
          <div className="value">{stats.daysWorked}日</div>
        </div>
        <div className="summary-item">
          <div className="label">1日平均</div>
          <div className="value">{formatDuration(Math.round(stats.averageHoursPerDay * 60))}</div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
