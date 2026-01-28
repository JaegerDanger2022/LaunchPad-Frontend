/**
 * Check if all dependencies of a milestone are completed
 * @param milestone - The milestone object with optional dependencies array
 * @param dreams - User's dreams array containing roadmap with milestones
 * @returns true if all dependencies are completed, false otherwise
 */
export const areDependenciesCompleted = (
  milestone: any,
  dreams: any[] | undefined,
): boolean => {
  // If no dependencies, it's available
  if (!milestone?.dependencies || !Array.isArray(milestone.dependencies) || milestone.dependencies.length === 0) {
    return true;
  }

  // If no dreams data, assume dependencies are not met
  if (!dreams || !Array.isArray(dreams)) {
    return false;
  }

  // Check if all dependency milestone IDs have status "completed"
  const dependencyIds = milestone.dependencies;

  for (const dream of dreams) {
    if (dream.roadmap?.milestones && Array.isArray(dream.roadmap.milestones)) {
      for (const m of dream.roadmap.milestones) {
        // If this milestone is a dependency, check if it's completed
        if (dependencyIds.includes(m.id) && m.status !== "completed") {
          return false;
        }
      }
    }
  }

  // All dependencies are completed
  return true;
};
