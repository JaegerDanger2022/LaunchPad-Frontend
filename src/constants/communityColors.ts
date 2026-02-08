import { DreamCategory } from '../types/community';

export const CATEGORY_COLORS: Record<DreamCategory, string> = {
  career_professional: '#2D5BFF',      // Blue
  personal_development: '#7B61FF',     // Purple
  health_wellness: '#FF006E',          // Pink
  creative_expression: '#FF5C00',      // Orange
  relationships_community: '#10B981',  // Green
  travel_exploration: '#00B4D8',       // Teal
  finance_security: '#F59E0B',         // Amber
  lifestyle_hobbies: '#8B5CF6',        // Violet
  courage_challenges: '#EF4444',       // Red
  achievement_goals: '#F97316',        // Orange-Red
};

export const CATEGORY_LABELS: Record<DreamCategory, string> = {
  career_professional: 'CAREER & PROFESSIONAL',
  personal_development: 'PERSONAL DEVELOPMENT',
  health_wellness: 'HEALTH & WELLNESS',
  creative_expression: 'CREATIVE EXPRESSION',
  relationships_community: 'RELATIONSHIPS & COMMUNITY',
  travel_exploration: 'TRAVEL & EXPLORATION',
  finance_security: 'FINANCE & SECURITY',
  lifestyle_hobbies: 'LIFESTYLE & HOBBIES',
  courage_challenges: 'COURAGE & CHALLENGES',
  achievement_goals: 'ACHIEVEMENT & GOALS',
};

export const getCategoryColor = (category: DreamCategory): string => {
  return CATEGORY_COLORS[category];
};

export const getCategoryLabel = (category: DreamCategory): string => {
  return CATEGORY_LABELS[category];
};

// Light variants for backgrounds
export const CATEGORY_COLORS_LIGHT: Record<DreamCategory, string> = {
  career_professional: '#E0E9FF',
  personal_development: '#F3E8FF',
  health_wellness: '#FFE0EC',
  creative_expression: '#FFE5D5',
  relationships_community: '#D1FAE5',
  travel_exploration: '#D1F4FF',
  finance_security: '#FEFCE8',
  lifestyle_hobbies: '#F5E8FF',
  courage_challenges: '#FEE2E2',
  achievement_goals: '#FFEDD5',
};
