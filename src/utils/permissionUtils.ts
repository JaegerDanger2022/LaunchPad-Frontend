import { DreamCategory, PermissionType } from '../types/community';

// Permission template texts
export const PERMISSION_TEMPLATES: Record<number, string> = {
  1: 'Permission granted to keep going',
  2: 'Permission granted to be proud of this',
  3: 'Permission granted to inspire the rest of us',
  4: 'dynamic', // Changes based on dream category
  5: 'Permission granted to take up space',
  6: 'Permission granted to celebrate loudly',
  7: 'Permission granted to rest after this win',
  8: 'Permission granted to believe this is just the beginning',
};

// Category-specific permission texts for type 4
const CATEGORY_PERMISSIONS: Record<DreamCategory, string> = {
  career_professional: 'Permission granted to call yourself a leader',
  personal_development: 'Permission granted to call yourself a learner',
  health_wellness: 'Permission granted to call yourself an athlete',
  creative_expression: 'Permission granted to call yourself a creator',
  relationships_community: 'Permission granted to call yourself a connector',
  travel_exploration: 'Permission granted to call yourself a traveler',
  finance_security: 'Permission granted to call yourself financially savvy',
  lifestyle_hobbies: 'Permission granted to call yourself dedicated',
  courage_challenges: 'Permission granted to call yourself brave',
  achievement_goals: 'Permission granted to call yourself a champion',
};

/**
 * Get permission text based on type and dream category
 */
export function getPermissionText(
  permissionType: PermissionType,
  dreamCategory: DreamCategory,
): string {
  if (permissionType === 4) {
    return CATEGORY_PERMISSIONS[dreamCategory] || 'Permission granted to own this moment';
  }
  return PERMISSION_TEMPLATES[permissionType];
}

/**
 * Get all permission options for a given dream category
 */
export function getPermissionOptions(
  dreamCategory: DreamCategory,
): Array<{ type: PermissionType; text: string }> {
  return [
    { type: 1, text: PERMISSION_TEMPLATES[1] },
    { type: 2, text: PERMISSION_TEMPLATES[2] },
    { type: 3, text: PERMISSION_TEMPLATES[3] },
    { type: 4, text: CATEGORY_PERMISSIONS[dreamCategory] || 'Permission granted to own this moment' },
    { type: 5, text: PERMISSION_TEMPLATES[5] },
    { type: 6, text: PERMISSION_TEMPLATES[6] },
    { type: 7, text: PERMISSION_TEMPLATES[7] },
    { type: 8, text: PERMISSION_TEMPLATES[8] },
  ];
}
