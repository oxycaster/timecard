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
    // 表示するレコードを選択
    let displayRecords = [];

    // 1. 今日出勤かつ今日退勤したレコードを取得
    const todayRecords = records.filter(record => 
      record.clockOut !== null && 
      isToday(new Date(record.clockIn).toISOString().split('T')[0]) && 
      isToday(new Date(record.clockOut).toISOString().split('T')[0])
    );
    displayRecords.push(...todayRecords);

    // 2. 未完了のセッション（clockOutがnull）をすべて取得（日付に関わらず）
    const activeRecords = records.filter(record => record.clockOut === null);
    displayRecords.push(...activeRecords);

    // 注：今日でない完了済みセッションは表示しない

    // 重複を削除
    displayRecords = displayRecords.filter((record, index, self) => 
      index === self.findIndex(r => r.id === record.id)
    );

    console.log('Display records:', displayRecords); // デバッグ用

    // 日付でソートして古い順に並べる（セッション番号を割り当てるため）
    const sortedByOldestRecords = [...displayRecords].sort((a, b) => 
      new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()
    );

    // DailySession形式に変換
    const sessions = sortedByOldestRecords.map((record: TimeRecord) => {
      const duration = calculateDuration(record.clockIn, record.clockOut);

      return {
        id: record.id,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        duration
      };
    });

    setTodaySessions(sessions);

    // 完了したセッションの合計時間を計算
    const total = sessions.reduce((sum: number, session: DailySession) => {
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
      <div className="today-sessions-table">
        <div className="table-header">
          <div className="header-cell session-cell">セッション</div>
          <div className="header-cell time-cell">出勤時間</div>
          <div className="header-cell time-cell">退勤時間</div>
          <div className="header-cell duration-cell">勤務時間</div>
        </div>
        <div className="table-body">
          {/* 降順で表示（新しいセッションが上に来るように） */}
          {[...todaySessions].reverse().map((session, index) => (
            <div key={session.id} className="table-row">
              <div className="table-cell session-cell">
                セッション {todaySessions.length - index}
              </div>
              <div className="table-cell time-cell">
                {formatDateTime(session.clockIn)}
              </div>
              <div className="table-cell time-cell">
                {session.clockOut ? formatDateTime(session.clockOut) : '勤務中'}
              </div>
              <div className="table-cell duration-cell">
                {formatDuration(session.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="total-time">
        <span className="label">本日の合計時間:</span>
        <span className="value">{formatDuration(totalTime)}</span>
      </div>
    </div>
  );
};

export default TodaySessions;
