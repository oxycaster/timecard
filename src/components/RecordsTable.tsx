import { TimeRecord } from '../types';
import { formatDateTime, calculateDuration, formatDuration, toJSTDate } from '../utils/formatters';

interface RecordsTableProps {
  records: TimeRecord[];
}

const RecordsTable: React.FC<RecordsTableProps> = ({ records }) => {
  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    return toJSTDate(b.clockIn).getTime() - toJSTDate(a.clockIn).getTime();
  });

  if (sortedRecords.length === 0) {
    return (
      <div className="records-table-container">
        <h3>勤務履歴</h3>
        <p className="no-records">勤務記録がありません</p>
      </div>
    );
  }

  return (
    <div className="records-table-container">
      <h3>勤務履歴</h3>
      <div className="records-table">
        <div className="table-header">
          <div className="header-cell date-cell">日付</div>
          <div className="header-cell time-cell">出勤時間</div>
          <div className="header-cell time-cell">退勤時間</div>
          <div className="header-cell duration-cell">勤務時間</div>
        </div>
        <div className="table-body">
          {sortedRecords.map(record => {
            const clockInDate = toJSTDate(record.clockIn);
            const clockOutDate = record.clockOut ? toJSTDate(record.clockOut) : null;
            const duration = calculateDuration(record.clockIn, record.clockOut);

            return (
              <div key={record.id} className="table-row">
                <div className="table-cell date-cell">
                  {clockInDate.toLocaleDateString('ja-JP')}
                </div>
                <div className="table-cell time-cell">
                  {clockInDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="table-cell time-cell">
                  {clockOutDate 
                    ? clockOutDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                    : '勤務中'}
                </div>
                <div className="table-cell duration-cell">
                  {formatDuration(duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecordsTable;
