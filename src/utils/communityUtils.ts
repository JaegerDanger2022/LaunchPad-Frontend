// Community Feature Utilities

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }

    // Check if yesterday
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }

    // Days ago (within 7 days)
    const daysAgo = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo <= 7) {
      return `${daysAgo} days ago`;
    }

    // Format as "Jan 28, 2026"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return 'Date unknown';
  }
}

export function getConfidenceText(confidenceBoost: number): string {
  if (confidenceBoost >= 50) return 'Confidence';
  if (confidenceBoost >= 30) return 'Confidence';
  if (confidenceBoost >= 10) return 'Confidence';
  return 'Confidence';
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function formatTimeframe(
  timeframe: 'all' | 'week' | 'month'
): string {
  const map: Record<typeof timeframe, string> = {
    all: 'All Time',
    week: 'This Week',
    month: 'This Month',
  };
  return map[timeframe];
}
