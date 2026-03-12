import { LucideIcon } from 'lucide-react';

export type Mood = 'Calm' | 'Joy' | 'Reflective' | 'Sad' | 'Neutral';

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
}

export interface Insight {
  id: string;
  type: 'exercise' | 'sleep' | 'meditation';
  text: string;
  icon: string;
  color: string;
}

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  mood?: string;
  moodInfluence?: string;
  influences?: string[];
  energy?: number;
  reflection?: string; // Keep for migration
  reflections?: string[];
  habits: Habit[];
}

export type ViewType = 'insights' | 'profile' | 'onboarding' | 'welcome' | 'signup' | 'login' | 'dashboard_placeholder';

export interface UserAccount {
  id?: string;
  username: string;
  password?: string;
}

export interface UserProfile {
  name: string;
  goal: string;
  firstHabit?: string;
  initialMood?: string;
  username?: string;
}
