import { useEffect, useState } from 'react';
import { TimeRecord, MonthlyStats } from '../types';
import { formatDuration, getJSTISOString } from '../utils/formatters';
import { calculateMonthlyStats } from '../utils/monthlyStats';

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

  // Update current time every second regardless of active session
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getJSTISOString());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setStats(calculateMonthlyStats(records, contractHours, activeSession, currentTime));
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
