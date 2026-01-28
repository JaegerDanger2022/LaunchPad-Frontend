export interface Task {
  id: string;
  title: string;
  timeMinutes: number;
  xpPoints: number;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  imageUrl?: string;
}

export interface UpNextMilestone {
  milestone_id: string;
  milestone_title: string;
  dream_thread_id: string;
  dream_title: string;
  time_estimate: string;
  xp_points: number;
  challenge_type: string;
  streak_eligible: boolean;
  updated_at: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_completion_date: string;
  total_completions: number;
  streak_freeze_available: boolean;
  milestone_achievements: {
    three_day_count: number;
    seven_day_count: number;
    thirty_day_count: number;
  };
}

export type NavTab = 'dreams' | 'home';
export type ContentTab = 'recents' | 'inspiration';
