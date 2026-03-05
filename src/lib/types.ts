export type HabitType = 'boolean' | 'count' | 'duration' | 'measurement' | 'health';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  category: 'health' | 'productivity' | 'learning' | 'wellness' | 'lifestyle' | 'finance';
  targetValue: number;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 for Sunday-Saturday
  reminderTime?: string; // HH:mm
  color: string;
  createdAt: number;
  streak: number;
  xp: number;
  lastCompletedAt?: number;
  metadata?: Record<string, unknown>;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  timestamp: number;
  source: 'manual' | 'reminder' | 'auto';
  note?: string;
  metadata?: Record<string, unknown>;
}

export interface UserSettings {
  name: string;
  nickname?: string;
  email?: string;
  theme: 'light' | 'dark' | 'system';
  isPro: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
}

export interface HealthLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weight?: number;
  note?: string;
  photos?: string[];
  metadata?: Record<string, unknown> | ConditionMetadata;
  timestamp: number;
}

export interface ConditionMetadata {
  type?: 'condition' | 'vital'; // 'vital' is default if undefined
  condition?: string;
  status?: 'active' | 'recovered' | 'chronic';
  severity?: 'mild' | 'moderate' | 'severe';
  symptoms?: string[];
  medicines?: string[];
  onset_date?: string;
  end_date?: string;
  fever?: boolean; // Legacy support
  medicine?: string; // Legacy support
  intensity?: string; // Legacy support
}
