import { useState, useEffect } from 'react';
import { formatTime, formatDate, toJSTDate, getJSTISOString } from '../utils/formatters';

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(toJSTDate(getJSTISOString()));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(toJSTDate(getJSTISOString()));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="current-time">
      <div className="date">{formatDate(currentTime)}</div>
      <div className="time">{formatTime(currentTime)}</div>
    </div>
  );
};

export default CurrentTime;
