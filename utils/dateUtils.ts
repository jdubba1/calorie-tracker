// Format a date into YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Get the start of a day (midnight)
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get the end of a day (23:59:59.999)
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Check if a timestamp is from today
export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);
  return formatDate(today) === formatDate(date);
};

// Check if a timestamp falls within a specific date
export const isFromDate = (timestamp: number, targetDate: Date): boolean => {
  const date = new Date(timestamp);
  return formatDate(date) === formatDate(targetDate);
};

// Get a date offset from another date
export const getOffsetDate = (date: Date, offsetDays: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + offsetDays);
  return result;
};

// Format date for display (e.g., "Monday, May 1")
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

// Calculate daily stats from entries
export type EntryStat = {
  date: string;
  totalCalories: number;
  totalProtein: number;
  count: number;
};

export const calculateDailyStats = (
  entries: any[],
): Record<string, EntryStat> => {
  const stats: Record<string, EntryStat> = {};

  for (const entry of entries) {
    const date = formatDate(new Date(entry.timestamp));

    if (!stats[date]) {
      stats[date] = {
        date,
        totalCalories: 0,
        totalProtein: 0,
        count: 0,
      };
    }

    stats[date].totalCalories += entry.calories;
    stats[date].totalProtein += entry.protein;
    stats[date].count += 1;
  }

  return stats;
};

// Calculate average stats (excluding current day)
export const calculateAverages = (
  dailyStats: Record<string, EntryStat>,
  excludeToday: boolean = true,
): { avgCalories: number; avgProtein: number } => {
  const today = formatDate(new Date());
  let totalCalories = 0;
  let totalProtein = 0;
  let days = 0;

  for (const date in dailyStats) {
    if (excludeToday && date === today) continue;

    totalCalories += dailyStats[date].totalCalories;
    totalProtein += dailyStats[date].totalProtein;
    days++;
  }

  return {
    avgCalories: days > 0 ? Math.round(totalCalories / days) : 0,
    avgProtein: days > 0 ? Math.round(totalProtein / days) : 0,
  };
};
