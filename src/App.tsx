import { useState, useEffect } from 'react';
import './App.css';
import CurrentTime from './components/CurrentTime';
import ClockButtons from './components/ClockButtons';
import CurrentSession from './components/CurrentSession';
import TodaySessions from './components/TodaySessions';
import MonthlySummary from './components/MonthlySummary';
import RecordsTable from './components/RecordsTable';
import MonthlyTotals from './components/MonthlyTotals';
import SlackSettings from './components/SlackSettings';
import { fetchRecords, clockOut } from './utils/api';
import { TimeRecord } from './types';
import { toJSTDate, getJSTISOString } from './utils/formatters';

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

      // 日付に関係なく、未完了のセッション（clockOutがnull）を探す
      const unfinishedSessions = data.filter(record => record.clockOut === null);
      // 未完了セッションがある場合は、最新のものをアクティブセッションとして設定
      const active = unfinishedSessions.length > 0 
        ? unfinishedSessions.sort((a, b) => toJSTDate(b.clockIn).getTime() - toJSTDate(a.clockIn).getTime())[0]
        : null;

      if (active) {
        setActiveSession(active);
      }

      setLoading(false);
    };

    loadRecords();
  }, []);

  const handleClockInOut = (record: TimeRecord | null) => {
    if (record) {
      // Clock in - add new record and set as active
      setRecords(prev => [...prev, record]);
      setActiveSession(record);

      // データを再取得して最新の状態を確保
      fetchRecords().then(freshData => {
        setRecords(freshData);
      });
    } else {
      // Clock out - update the active record and clear active session
      if (!activeSession) return;

      // 一時的にUIを更新（オプティミスティックUI更新）
      setRecords(prev => {
        return prev.map(r => {
          if (r.id === activeSession.id) {
            return { ...r, clockOut: getJSTISOString() };
          }
          return r;
        });
      });

      // サーバーからの応答後、データを再取得
      clockOut(activeSession.id).then(() => {
        fetchRecords().then(freshData => {
          setRecords(freshData);
          setActiveSession(null);
        });
      });
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
            <MonthlySummary 
              records={records}
              contractHours={CONTRACT_HOURS}
              activeSession={activeSession}
            />
          </div>
        </div>

        <div className="middle-section">
          <TodaySessions records={records} />
        </div>

        <div className="bottom-section">
          <RecordsTable records={records} />
          <MonthlyTotals records={records} />
        </div>
      </main>

      <footer className="app-footer">
        <div className="settings-section">
          <SlackSettings />
        </div>
        <p>© 2025 勤怠管理システム</p>
      </footer>
    </div>
  );
}

export default App;
