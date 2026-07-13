import { useEffect, useMemo, useState } from 'react';
import { TimeRecord } from '../types';
import { getJSTDateString, getJSTISOString } from '../utils/formatters';
import { buildBurndownPoints } from '../utils/monthlyStats';

interface MonthlyBurndownChartProps {
  records: TimeRecord[];
  contractHours: number;
  activeSession?: TimeRecord | null;
  selectedMonth: string;
  onSelectedMonthChange: (month: string) => void;
}

const CHART_WIDTH = 760;
const CHART_HEIGHT = 320;
const PADDING = { top: 24, right: 24, bottom: 46, left: 58 };

const formatHours = (minutes: number) => `${Math.round(minutes / 60)}h`;

const MonthlyBurndownChart: React.FC<MonthlyBurndownChartProps> = ({
  records,
  contractHours,
  activeSession,
  selectedMonth,
  onSelectedMonthChange
}) => {
  const [currentTime, setCurrentTime] = useState(getJSTISOString());
  const currentMonth = getJSTDateString().slice(0, 7);

  useEffect(() => {
    if (selectedMonth !== currentMonth) return undefined;

    const timer = setInterval(() => setCurrentTime(getJSTISOString()), 1000);
    return () => clearInterval(timer);
  }, [selectedMonth, currentMonth]);

  const { points, actualPoints, yTicks, xTickIndices } = useMemo(() => {
    const allPoints = buildBurndownPoints(
      records,
      contractHours,
      activeSession,
      currentTime,
      selectedMonth
    );
    const today = getJSTDateString();
    const visibleActualPoints = selectedMonth === currentMonth
      ? allPoints.filter(point => point.date <= today)
      : allPoints;
    const maxRemaining = Math.max(
      contractHours * 60,
      ...allPoints.map(point => point.remainingMinutes)
    );
    const step = Math.max(60, Math.ceil(maxRemaining / 4 / 60) * 60);
    const maxY = step * Math.ceil(maxRemaining / step);
    const ticks = Array.from({ length: 5 }, (_, index) => (maxY / 4) * index);
    const labelEvery = allPoints.length <= 28 ? 4 : 5;
    const tickIndices = allPoints.reduce<number[]>((indices, _, index) => {
      if (index === 0 || index === allPoints.length - 1 || index % labelEvery === 0) indices.push(index);
      return indices;
    }, []);

    return { points: allPoints, actualPoints: visibleActualPoints, yTicks: ticks, xTickIndices: tickIndices };
  }, [records, contractHours, activeSession, currentTime, selectedMonth, currentMonth]);

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const x = (index: number) => PADDING.left + (plotWidth * index) / Math.max(1, points.length - 1);
  const y = (minutes: number) => PADDING.top + plotHeight - (minutes / yTicks[yTicks.length - 1]) * plotHeight;
  const toPath = (values: { remainingMinutes: number; idealRemainingMinutes: number }[], value: 'remainingMinutes' | 'idealRemainingMinutes') =>
    values.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point[value])}`).join(' ');
  const actualPath = actualPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.remainingMinutes)}`)
    .join(' ');

  return (
    <section className="monthly-burndown" aria-labelledby="burndown-title">
      <div className="burndown-header">
        <h3 id="burndown-title">月間バーンダウン</h3>
        <label className="month-picker">
          <span>対象月</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={event => onSelectedMonthChange(event.target.value)}
            aria-label="対象月"
          />
        </label>
      </div>
      <div className="burndown-legend" aria-label="グラフの凡例">
        <span><i className="legend-line actual" />実績</span>
        <span><i className="legend-line ideal" />理想</span>
      </div>
      <div className="burndown-chart-wrap">
        <svg className="burndown-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={`${selectedMonth}の残り時間バーンダウンチャート`}>
          {yTicks.map(tick => (
            <g key={tick}>
              <line className="chart-grid-line" x1={PADDING.left} x2={CHART_WIDTH - PADDING.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-y-label" x={PADDING.left - 10} y={y(tick) + 4}>{formatHours(tick)}</text>
            </g>
          ))}
          <line className="chart-axis" x1={PADDING.left} x2={PADDING.left} y1={PADDING.top} y2={PADDING.top + plotHeight} />
          <line className="chart-axis" x1={PADDING.left} x2={CHART_WIDTH - PADDING.right} y1={PADDING.top + plotHeight} y2={PADDING.top + plotHeight} />
          {xTickIndices.map(index => (
            <text key={points[index].date} className="chart-x-label" x={x(index)} y={CHART_HEIGHT - 18} textAnchor="middle">
              {Number(points[index].date.slice(-2))}日
            </text>
          ))}
          <path className="chart-ideal-line" d={toPath(points, 'idealRemainingMinutes')} />
          {actualPath && <path className="chart-actual-line" d={actualPath} />}
        </svg>
      </div>
      <p className="burndown-axis-label">残り時間</p>
    </section>
  );
};

export default MonthlyBurndownChart;
