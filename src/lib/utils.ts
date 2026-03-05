import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HABIT_COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
];

export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export interface LogEntry {
  date: string;
}

export function calculateStreak(logs: LogEntry[]): number {
  if (logs.length === 0) return 0;
  
  // Extract unique dates and sort them descending
  const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the most recent log is today or yesterday
  const latestLogDate = new Date(uniqueDates[0]);
  latestLogDate.setHours(0, 0, 0, 0);

  if (latestLogDate < yesterday) {
    return 0;
  }

  let streak = 0;
  const checkDate = latestLogDate;

  for (const dateStr of uniqueDates) {
    const logDate = new Date(dateStr);
    logDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (logDate.getTime() > checkDate.getTime()) {
      // This shouldn't happen with sorted unique dates, but just in case
      continue;
    } else {
      // Gap found
      break;
    }
  }
  
  return streak;
}

export function getLastNDays(n: number) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function getCompletionStats(habits: { id: string }[], logs: { habitId: string, date: string }[], days: number = 7) {
  const lastDays = getLastNDays(days);
  return lastDays.map(date => {
    const dayLogs = logs.filter(l => l.date === date);
    const dayHabitsCount = habits.length;
    return {
      date: date.split('-').slice(1).join('/'),
      completed: dayLogs.length,
      total: dayHabitsCount,
      rate: dayHabitsCount > 0 ? (dayLogs.length / dayHabitsCount) * 100 : 0
    };
  });
}
