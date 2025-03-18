import { useState } from 'react';
import { clockIn, clockOut } from '../utils/api';
import { TimeRecord } from '../types';

interface ClockButtonsProps {
  activeSession: TimeRecord | null;
  onClockInOut: (record: TimeRecord | null) => void;
}

const ClockButtons: React.FC<ClockButtonsProps> = ({ activeSession, onClockInOut }) => {
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    if (loading) return;
    
    setLoading(true);
    const record = await clockIn();
    setLoading(false);
    
    if (record) {
      onClockInOut(record);
    }
  };

  const handleClockOut = async () => {
    if (!activeSession || loading) return;
    
    setLoading(true);
    const record = await clockOut(activeSession.id);
    setLoading(false);
    
    if (record) {
      onClockInOut(null);
    }
  };

  return (
    <div className="clock-buttons">
      <button 
        className={`clock-button clock-in ${activeSession ? 'disabled' : ''}`}
        onClick={handleClockIn}
        disabled={!!activeSession || loading}
      >
        出勤
      </button>
      <button 
        className={`clock-button clock-out ${!activeSession ? 'disabled' : ''}`}
        onClick={handleClockOut}
        disabled={!activeSession || loading}
      >
        退勤
      </button>
    </div>
  );
};

export default ClockButtons;
