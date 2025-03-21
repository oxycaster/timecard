import { TimeRecord } from '../types';
import { formatDateTime, calculateDuration, formatDuration, toJSTDate } from '../utils/formatters';

interface RecordsTableProps {
  records: TimeRecord[];
}

// Interface for grouped records
interface GroupedRecords {
  [date: string]: TimeRecord[];
}

const RecordsTable: React.FC<RecordsTableProps> = ({ records }) => {
  // Group records by date (based on the date field)
  const groupedRecords: GroupedRecords = records.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as GroupedRecords);

  // Sort dates (newest first)
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (records.length === 0) {
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
          {sortedDates.map(date => {
            // Sort records within each date group by clock-in time
            const dateRecords = [...groupedRecords[date]].sort((a, b) => {
              return toJSTDate(a.clockIn).getTime() - toJSTDate(b.clockIn).getTime();
            });

            // Calculate total duration for the date
            const totalDuration = dateRecords.reduce((total, record) => {
              return total + (calculateDuration(record.clockIn, record.clockOut) || 0);
            }, 0);

            return (
              <div key={date} className="date-group">
                <div className="date-header">
                  <div className="date-label">
                    {new Date(date).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="date-total">
                    合計: {formatDuration(totalDuration)}
                  </div>
                </div>

                {dateRecords.map(record => {
                  const clockInDate = toJSTDate(record.clockIn);
                  const clockOutDate = record.clockOut ? toJSTDate(record.clockOut) : null;
                  const duration = calculateDuration(record.clockIn, record.clockOut);

                  return (
                    <div key={record.id} className="table-row">
                      <div className="table-cell date-cell">
                        {/* Date is now in the group header */}
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecordsTable;
