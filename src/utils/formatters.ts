export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Helper function to parse ISO string as JST Date object
export const toJSTDate = (dateString: string): Date => {
  // Parse the date string, and subtract 9 hours if it has a Z suffix (UTC)
  // This is because the server stores JST times with a Z suffix
  const date = new Date(dateString);
  if (dateString.endsWith('Z')) {
    return new Date(date.getTime() - (9 * 60 * 60 * 1000));
  }
  return date;
};

// Helper function to get current date in JST as YYYY-MM-DD
export const getJSTDateString = (date: Date = new Date()): string => {
  // Add 9 hours to convert from UTC to JST
  const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  return jstDate.toISOString().split('T')[0];
};

// Helper function to get current time in JST as ISO string
export const getJSTISOString = (date: Date = new Date()): string => {
  // Add 9 hours to convert from UTC to JST
  const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  return jstDate.toISOString();
};

export const formatDateTime = (dateString: string): string => {
  const date = toJSTDate(dateString);
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const calculateDuration = (startTime: string, endTime: string | null): number | null => {
  if (!endTime) return null;

  const start = toJSTDate(startTime).getTime();
  const end = toJSTDate(endTime).getTime();

  // Return duration in minutes
  return Math.round((end - start) / (1000 * 60));
};

export const formatDuration = (minutes: number | null): string => {
  if (minutes === null) return '--:--';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getCurrentMonthRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return { start, end };
};

export const isToday = (dateString: string): boolean => {
  const date = toJSTDate(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isCurrentMonth = (dateString: string): boolean => {
  const date = toJSTDate(dateString);
  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
