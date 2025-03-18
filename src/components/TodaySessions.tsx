import { useEffect, useState } from 'react';
import { TimeRecord, DailySession } from '../types';
import { isToday, formatDateTime, calculateDuration, formatDuration } from '../utils/formatters';

interface TodaySessionsProps {
  records: TimeRecord[];
}

const TodaySessions: React.FC<TodaySessionsProps> = ({ records }) => {
  const [todaySessions, setTodaySessions] = useState<DailySession[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);

  useEffect(() => {
    // Filter records for today
    const todayRecords = records.filter(record => isToday(record.date));
    
    // Convert to DailySession format
    const sessions = todayRecords.map(record => {
      const duration = calculateDuration(record.clockIn, record.clockOut);
      
      return {
        id: record.id,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        duration
      };
    });
    
    setTodaySessions(sessions);
    
    // Calculate total time (excluding active sessions)
    const total = sessions.reduce((sum, session) => {
      return sum + (session.duration || 0);
    }, 0);
    
    setTotalTime(total);
  }, [records]);

  if (todaySessions.length === 0) {
    return (
      <div className="today-sessions">
        <h3>本日の勤務記録</h3>
        <p className="no-sessions">本日の勤務記録はありません</p>
      </div>
    );
  }

  return (
    <div className="today-sessions">
      <h3>本日の勤務記録</h3>
      <div className="sessions-list">
        {todaySessions.map(session => (
          <div key={session.id} className="session-item">
            <div className="time-range">
              {formatDateTime(session.clockIn)} 
              {session.clockOut ? ` - ${formatDateTime(session.clockOut)}` : ' (勤務中)'}
            </div>
            <div className="duration">
              {formatDuration(session.duration)}
            </div>
          </div>
        ))}
      </div>
      <div className="total-time">
        <span className="label">本日の合計時間:</span>
        <span className="value">{formatDuration(totalTime)}</span>
      </div>
    </div>
  );
};

export default TodaySessions;
