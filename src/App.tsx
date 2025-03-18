import { useState, useEffect } from 'react';
import './App.css';
import CurrentTime from './components/CurrentTime';
import ClockButtons from './components/ClockButtons';
import CurrentSession from './components/CurrentSession';
import TodaySessions from './components/TodaySessions';
import MonthlySummary from './components/MonthlySummary';
import RecordsTable from './components/RecordsTable';
import { fetchRecords } from './utils/api';
import { TimeRecord } from './types';
import { isToday } from './utils/formatters';

// 月間の契約時間（時間）
const CONTRACT_HOURS = 128;

function App() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [activeSession, setActiveSession] = useState<TimeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      const data = await fetchRecords();
      setRecords(data);
      
      // Check if there's an active session (clock in without clock out today)
      const todayRecords = data.filter(record => isToday(record.date));
      const active = todayRecords.find(record => record.clockOut === null);
      
      if (active) {
        setActiveSession(active);
      }
      
      setLoading(false);
    };
    
    loadRecords();
    
    // Refresh data every minute
    const interval = setInterval(loadRecords, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleClockInOut = (record: TimeRecord | null) => {
    if (record) {
      // Clock in - add new record and set as active
      setRecords(prev => [...prev, record]);
      setActiveSession(record);
    } else {
      // Clock out - update the active record and clear active session
      setRecords(prev => {
        if (!activeSession) return prev;
        
        return prev.map(r => {
          if (r.id === activeSession.id) {
            // This should be updated with the latest data from the server
            // but for now we'll just update it locally
            return { ...r, clockOut: new Date().toISOString() };
          }
          return r;
        });
      });
      
      setActiveSession(null);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>勤怠管理システム</h1>
        <CurrentTime />
      </header>
      
      <main className="app-content">
        <div className="top-section">
          <div className="left-panel">
            <CurrentSession activeSession={activeSession} />
            <ClockButtons 
              activeSession={activeSession}
              onClockInOut={handleClockInOut}
            />
          </div>
          
          <div className="right-panel">
            <TodaySessions records={records} />
          </div>
        </div>
        
        <div className="bottom-section">
          <MonthlySummary 
            records={records}
            contractHours={CONTRACT_HOURS}
          />
          <RecordsTable records={records} />
        </div>
      </main>
      
      <footer className="app-footer">
        <p>© 2025 勤怠管理システム</p>
      </footer>
    </div>
  );
}

export default App;
