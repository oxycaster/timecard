import { useState, useEffect } from 'react';
import { TimeRecord } from '../types';
import { formatDateTime, calculateDuration, formatDuration, isToday, getJSTDateString, getJSTISOString } from '../utils/formatters';

interface CurrentSessionProps {
  activeSession: TimeRecord | null;
}

const CurrentSession: React.FC<CurrentSessionProps> = ({ activeSession }) => {
  const [currentTime, setCurrentTime] = useState<string>(getJSTISOString());
  const [formattedDuration, setFormattedDuration] = useState<string>('00:00');

  // Update current time every second when there's an active session
  useEffect(() => {
    if (!activeSession) return;

    // Initial calculation
    const duration = calculateDuration(activeSession.clockIn, currentTime);
    setFormattedDuration(formatDuration(duration));

    // Set up interval to update every second
    const timer = setInterval(() => {
      const newCurrentTime = getJSTISOString();
      setCurrentTime(newCurrentTime);
      const newDuration = calculateDuration(activeSession.clockIn, newCurrentTime);
      setFormattedDuration(formatDuration(newDuration));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="current-session">
        <h3>現在の勤務状況</h3>
        <p className="no-session">勤務していません</p>
      </div>
    );
  }

  const clockInTime = formatDateTime(activeSession.clockIn);

  // 現在の日付を取得（JST）
  const todayString = getJSTDateString(); // YYYY-MM-DD形式（JST）

  // セッションの日付が今日と異なる場合のみ「前日からの継続」を表示
  const isPreviousDayContinuation = activeSession.date !== todayString;

  return (
    <div className="current-session">
      <h3>現在の勤務状況</h3>
      <div className="session-info">
        <div className="info-row">
          <span className="label">出勤時間:</span>
          <span className="value">
            {clockInTime}
            {isPreviousDayContinuation && ' (前日からの継続)'}
          </span>
        </div>
        <div className="info-row">
          <span className="label">経過時間:</span>
          <span className="value">{formattedDuration}</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentSession;
