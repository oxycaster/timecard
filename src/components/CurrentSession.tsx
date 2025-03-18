import { TimeRecord } from '../types';
import { formatDateTime, calculateDuration, formatDuration } from '../utils/formatters';

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

  return (
    <div className="current-session">
      <h3>現在の勤務状況</h3>
      <div className="session-info">
        <div className="info-row">
          <span className="label">出勤時間:</span>
          <span className="value">{clockInTime}</span>
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
