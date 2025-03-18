import { useEffect, useState } from 'react';
import { TimeRecord, MonthlyStats } from '../types';
import { isCurrentMonth, calculateDuration, formatDuration } from '../utils/formatters';

interface MonthlySummaryProps {
  records: TimeRecord[];
  contractHours: number;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ records, contractHours }) => {
  const [stats, setStats] = useState<MonthlyStats>({
    totalHours: 0,
    contractHours,
    remainingHours: contractHours,
    daysWorked: 0,
    averageHoursPerDay: 0
  });

  useEffect(() => {
    // Filter records for current month
    const monthRecords = records.filter(record => isCurrentMonth(record.date));
    
    // Only count completed sessions
    const completedRecords = monthRecords.filter(record => record.clockOut !== null);
    
    // Calculate total minutes
    const totalMinutes = completedRecords.reduce((sum, record) => {
      const duration = calculateDuration(record.clockIn, record.clockOut);
      return sum + (duration || 0);
    }, 0);
    
    // Convert to hours
    const totalHours = totalMinutes / 60;
    
    // Get unique days worked
    const uniqueDays = new Set();
    completedRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      uniqueDays.add(date);
    });
    
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
  }, [records, contractHours]);

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
