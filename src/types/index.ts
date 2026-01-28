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

export type NavTab = 'dreams' | 'home';
export type ContentTab = 'recents' | 'inspiration';
