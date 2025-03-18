import { TimeRecord } from '../types';
import { formatDateTime, calculateDuration, formatDuration, isToday } from '../utils/formatters';

interface CurrentSessionProps {
  activeSession: TimeRecord | null;
}

const CurrentSession: React.FC<CurrentSessionProps> = ({ activeSession }) => {
  if (!activeSession) {
    return (
      <div className="current-session">
        <h3>現在の勤務状況</h3>
        <p className="no-session">勤務していません</p>
      </div>
    );
  }

  const clockInTime = formatDateTime(activeSession.clockIn);
  const currentDuration = calculateDuration(
    activeSession.clockIn,
    new Date().toISOString()
  );
  const formattedDuration = formatDuration(currentDuration);
  
  // 現在の日付を取得
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
  
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
