export type HabitType = 'boolean' | 'count' | 'duration';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  targetValue: number;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 for Sunday-Saturday
  reminderTime?: string; // HH:mm
  color: string;
  createdAt: number;
  streak: number;
  lastCompletedAt?: number;
  metadata?: Record<string, any>;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  timestamp: number;
  note?: string;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark' | 'system';
  isPro: boolean;
}
