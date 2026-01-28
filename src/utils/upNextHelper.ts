import { UserData, UpNextMilestone } from '../config/api';

/**
 * Finds the next incomplete milestone from active dreams.
 * Priority order:
 * 1. Dreams from recents list (most recently viewed first)
 * 2. All dreams if recents don't have incomplete milestones
 *
 * Returns null if no incomplete milestones are found.
 */
export function findNextIncompleteMilestone(userData: UserData): UpNextMilestone | null {
  if (!userData?.dreams || userData.dreams.length === 0) {
    // console.log('No dreams found');
    return null;
  }

  const recents = userData.recents || [];
  const dreamsToCheck: any[] = [];

  // First, add dreams from recents in priority order
  for (const threadId of recents) {
    const dream = userData.dreams.find((d: any) => d.thread_id === threadId);
    if (dream) {
      dreamsToCheck.push(dream);
    }
  }

  // Then add all other dreams (fallback)
  for (const dream of userData.dreams) {
    if (!recents.includes(dream.thread_id)) {
      dreamsToCheck.push(dream);
    }
  }

  // Search through dreams in priority order
  for (const dream of dreamsToCheck) {
    // Check if dream is active and incomplete
    if (dream.status !== 'active') {
      continue;
    }

    if (dream.isComplete === true) {
      continue;
    }

    // Check for incomplete milestones
    if (!dream.roadmap?.milestones || dream.roadmap.milestones.length === 0) {
      continue;
    }

    // Find first incomplete milestone
    const incompleteMilestone = dream.roadmap.milestones.find(
      (m: any) => m.status !== 'completed'
    );

    if (incompleteMilestone) {
      const upNext: UpNextMilestone = {
        milestone_id: incompleteMilestone.id || '',
        milestone_title: incompleteMilestone.title || incompleteMilestone.name || 'Untitled Milestone',
        dream_thread_id: dream.thread_id,
        dream_title: dream.dream || 'Untitled Dream',
        time_estimate: incompleteMilestone.time_estimate || '30 mins',
        xp_points: incompleteMilestone.xp_points || 50,
        challenge_type: incompleteMilestone.challenge_type || 'power_move',
        streak_eligible: incompleteMilestone.streak_eligible ?? true,
        updated_at: new Date().toISOString(),
      };

      // console.log('Found next milestone:', upNext);
      // console.log('From dream:', dream.dream, 'Status:', dream.status, 'isComplete:', dream.isComplete);
      return upNext;
    } else {
      // All milestones in this dream are completed
      // console.log('All milestones completed in dream:', dream.dream);
    }
  }

  // No incomplete milestones found
  // console.log('No incomplete milestones found in any active dreams');
  return null;
}
