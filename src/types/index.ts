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

export type NavTab = 'dreams' | 'home';
export type ContentTab = 'recents' | 'inspiration';
