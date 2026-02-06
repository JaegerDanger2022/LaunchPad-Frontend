/**
 * Check if all dependencies of a milestone are completed.
 *
 * Sequential fallback: when no milestone in the owning roadmap has
 * explicit dependencies (the agent omitted the field entirely), treat
 * the roadmap as strictly sequential — each milestone is locked until
 * the one before it is completed; the first milestone is always unlocked.
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
  let ownerDream: any = null;
  for (const dream of dreams) {
    const ms = dream.roadmap?.milestones;
    if (ms && Array.isArray(ms)) {
      const idx = ms.findIndex((m: any) => m.id === milestone?.id);
      if (idx !== -1) {
        ownerMilestones = ms;
        milestoneIndex = idx;
        ownerDream = dream;
        break;
      }
    }
  }

  // Milestone not found in any roadmap – LOCK by default to prevent accidental unlocks
  // This prevents all milestones from unlocking when dream data isn't fully loaded
  if (!ownerMilestones || milestoneIndex === -1) {
    console.warn(
      '[DepChecker] Milestone not found in roadmap.',
      'This usually means data is still loading.',
      {
        milestoneId: milestone?.id,
        availableDreams: dreams?.length,
        dreamsWithMilestones: dreams?.filter(d => d.roadmap?.milestones?.length > 0).length,
      }
    );
    console.warn('[DepChecker] Locking milestone until dream data is fully loaded');
    // If we can't find the milestone, default to LOCKED (prevents premature unlocks)
    return false;
  }

  // A milestone has explicit dependencies only if it has a non-empty dependencies array
  const hasExplicitDeps =
    milestone?.dependencies &&
    Array.isArray(milestone.dependencies) &&
    milestone.dependencies.length > 0;

  if (!hasExplicitDeps) {
    // Check whether any milestone in THIS SPECIFIC roadmap uses dependencies
    // IMPORTANT: Only check the owner roadmap, not all dreams
    // IMPORTANT: Only count non-empty arrays as "having dependencies"
    // Empty arrays [] should be treated the same as missing/undefined
    const roadmapHasAnyDeps = ownerMilestones.some(
      (m: any) => m.dependencies && Array.isArray(m.dependencies) && m.dependencies.length > 0,
    );

    // Debug: Log all milestone dependency info for THIS roadmap only
    console.log('[DepChecker] Roadmap dependency analysis (owner roadmap only):', {
      dreamId: ownerDream?.thread_id,
      dreamTitle: ownerDream?.dream?.substring(0, 40),
      milestoneCount: ownerMilestones.length,
      roadmapHasAnyDeps,
      allMilestoneDeps: ownerMilestones.map((m: any) => ({
        id: m.id,
        title: m.title?.substring(0, 30),
        hasDepsField: m.dependencies !== undefined,
        isArray: Array.isArray(m.dependencies),
        length: m.dependencies?.length || 0,
        deps: m.dependencies,
      })),
    });

    if (!roadmapHasAnyDeps) {
      // Sequential fallback: first milestone is unlocked; every other
      // milestone requires the previous one to be completed.
      console.log('[DepChecker] Using SEQUENTIAL fallback for milestone:', {
        milestoneId: milestone?.id,
        milestoneTitle: milestone?.title,
        milestoneIndex,
        totalMilestones: ownerMilestones.length,
        isFirstMilestone: milestoneIndex === 0,
        previousMilestoneStatus: milestoneIndex > 0 ? ownerMilestones[milestoneIndex - 1]?.status : 'N/A',
      });

      if (milestoneIndex === 0) {
        return true;
      }
      const prevStatus = ownerMilestones[milestoneIndex - 1]?.status;
      return prevStatus === "completed";
    }

    // Roadmap uses deps elsewhere but this milestone has none – unlocked
    console.log('[DepChecker] Roadmap uses explicit deps, but THIS milestone has none - unlocking:', {
      milestoneId: milestone?.id,
      milestoneTitle: milestone?.title,
    });
    return true;
  }

  // Explicit dependencies: verify every dep ID is completed
  const dependencyIds: string[] = milestone.dependencies;
  console.log('[DepChecker] Checking EXPLICIT dependencies for milestone:', {
    milestoneId: milestone?.id,
    milestoneTitle: milestone?.title,
    dependencyIds,
    dependencyCount: dependencyIds.length,
  });

  for (const dream of dreams) {
    if (dream.roadmap?.milestones && Array.isArray(dream.roadmap.milestones)) {
      for (const m of dream.roadmap.milestones) {
        if (dependencyIds.includes(m.id) && m.status !== "completed") {
          console.log('[DepChecker] Blocking - incomplete dependency found:', {
            blockingMilestoneId: m.id,
            blockingMilestoneTitle: m.title,
            blockingMilestoneStatus: m.status,
          });
          return false;
        }
      }
    }
  }

  console.log('[DepChecker] All explicit dependencies completed - unlocking');
  return true;
};
