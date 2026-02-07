/**
 * Check if all dependencies of a milestone are completed.
 *
 * How it works:
 * - Milestones with no dependencies (empty array or missing field) are always unlocked
 * - Milestones with dependencies are unlocked only when ALL dependencies are completed
 * - Sequential dependencies are auto-generated at fetch time if missing (see api.ts)
 *
 * @param milestone - The milestone object with optional dependencies array
 * @param dreams - User's dreams array containing roadmap with milestones
 * @returns true if all dependencies are completed, false otherwise
 */
export const areDependenciesCompleted = (
  milestone: any,
  dreams: any[] | undefined,
): boolean => {
  if (!dreams || !Array.isArray(dreams)) {
    return false;
  }

  // Find the roadmap that owns this milestone and its index within it
  let ownerMilestones: any[] | null = null;
  let milestoneIndex = -1;
  for (const dream of dreams) {
    const ms = dream.roadmap?.milestones;
    if (ms && Array.isArray(ms)) {
      const idx = ms.findIndex((m: any) => m.id === milestone?.id);
      if (idx !== -1) {
        ownerMilestones = ms;
        milestoneIndex = idx;
        break;
      }
    }
  }

  // Milestone not found in any roadmap – LOCK by default to prevent accidental unlocks
  // This prevents all milestones from unlocking when dream data isn't fully loaded
  if (!ownerMilestones || milestoneIndex === -1) {
    // console.warn(
    //   '[DepChecker] Milestone not found in roadmap.',
    //   'This usually means data is still loading.',
    //   {
    //     milestoneId: milestone?.id,
    //     availableDreams: dreams?.length,
    //     dreamsWithMilestones: dreams?.filter(d => d.roadmap?.milestones?.length > 0).length,
    //   }
    // );
    // console.warn('[DepChecker] Locking milestone until dream data is fully loaded');
    // If we can't find the milestone, default to LOCKED (prevents premature unlocks)
    return false;
  }

  // Check if milestone has dependencies
  const dependencies = milestone?.dependencies;
  const hasDependencies = dependencies && Array.isArray(dependencies);

  // If no dependencies field or empty array, milestone is unlocked
  // (First milestone in sequential roadmaps will have empty array)
  if (!hasDependencies || dependencies.length === 0) {
    // console.log('[DepChecker] No dependencies - unlocking milestone:', {
    //   milestoneId: milestone?.id,
    //   milestoneTitle: milestone?.title,
    //   milestoneIndex,
    // });
    return true;
  }

  // Check each dependency - all must be completed
  const dependencyIds: string[] = dependencies;
  console.log('[DepChecker] Checking dependencies for milestone:', {
    milestoneId: milestone?.id,
    milestoneTitle: milestone?.title?.substring(0, 40),
    dependencyIds,
    dependencyCount: dependencyIds.length,
  });

  // Track found dependencies and their statuses
  const foundDeps: Array<{id: string, title: string, status: string}> = [];

  // IMPORTANT: Search for dependencies ONLY in the same dream (ownerMilestones)
  // This prevents false matches with milestones from other dreams that have the same ID
  for (const m of ownerMilestones) {
    if (dependencyIds.includes(m.id)) {
      foundDeps.push({
        id: m.id,
        title: m.title?.substring(0, 30) || 'Untitled',
        status: m.status || 'unknown'
      });

      if (m.status !== "completed") {
        console.log('[DepChecker] BLOCKED - dependency not completed:', {
          blockingMilestoneId: m.id,
          blockingMilestoneTitle: m.title?.substring(0, 40),
          blockingMilestoneStatus: m.status,
        });
        return false;
      }
    }
  }

  console.log('[DepChecker] Found dependencies:', foundDeps);

  // Check if we found all dependencies
  if (foundDeps.length !== dependencyIds.length) {
    console.warn('[DepChecker] WARNING: Not all dependencies found in same dream!', {
      expected: dependencyIds.length,
      found: foundDeps.length,
      missing: dependencyIds.filter(id => !foundDeps.some(d => d.id === id))
    });
    // If dependencies are missing from this dream, they might be cross-dream dependencies
    // For now, we'll return false (locked) to be safe
    return false;
  }

  console.log('[DepChecker] All dependencies completed - UNLOCKED');
  return true;
};
