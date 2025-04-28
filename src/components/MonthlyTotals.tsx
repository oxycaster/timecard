import React, { useMemo } from 'react';
import { TimeRecord } from '../types';
import { calculateDuration, formatDuration, toJSTDate } from '../utils/formatters';

interface MonthlyTotalsProps {
  records: TimeRecord[];
}

interface MonthlyTotal {
  year: number;
  month: number;
  totalMinutes: number;
  formattedMonth: string;
}

const MonthlyTotals: React.FC<MonthlyTotalsProps> = ({ records }) => {
  const monthlyTotals = useMemo(() => {
    // Group records by year and month
    const monthlyGroups: { [key: string]: TimeRecord[] } = {};

    records.forEach(record => {
      const date = toJSTDate(record.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const key = `${year}-${month.toString().padStart(2, '0')}`;

      if (!monthlyGroups[key]) {
        monthlyGroups[key] = [];
      }

      monthlyGroups[key].push(record);
    });

    // Calculate total minutes for each month
    const totals: MonthlyTotal[] = Object.keys(monthlyGroups).map(key => {
      const [year, month] = key.split('-').map(Number);
      const monthRecords = monthlyGroups[key];

      const totalMinutes = monthRecords.reduce((sum, record) => {
        const duration = calculateDuration(record.clockIn, record.clockOut);
        return sum + (duration || 0);
      }, 0);

      // Format month name in Japanese
      const formattedMonth = new Date(year, month - 1, 1).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long'
      });

      return {
        year,
        month,
        totalMinutes,
        formattedMonth
      };
    });

    // Sort by year and month (newest first)
    return totals.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  }, [records]);

  if (monthlyTotals.length === 0) {
    return (
      <div className="monthly-totals">
        <h3>月別稼働時間合計</h3>
        <p className="no-records">勤務記録がありません</p>
      </div>
    );
  }

  return (
    <div className="monthly-totals">
      <h3>月別稼働時間合計</h3>
      <div className="monthly-totals-table">
        <div className="table-header">
          <div className="header-cell month-cell">月</div>
          <div className="header-cell duration-cell">稼働時間合計</div>
        </div>
        <div className="table-body">
          {monthlyTotals.map(total => (
            <div key={`${total.year}-${total.month}`} className="table-row">
              <div className="table-cell month-cell">{total.formattedMonth}</div>
              <div className="table-cell duration-cell">{formatDuration(total.totalMinutes)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyTotals;
