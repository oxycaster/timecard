import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '../utils/formatters';

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
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
