/**
 * Showcase seed — static fake data for the demo account.
 * Injected by api.ts when the logged-in UID matches SHOWCASE_UID.
 * Remove this file (and the three early-returns in api.ts) to stop seeding.
 *
 * Dates are relative to 2026-02-05 (Thursday).  Milestone updated_at values
 * are chosen so that every analytics card has something interesting to show:
 *   – Weekly bars:   Mon–Thu of current week (Feb 2-5)
 *   – 7/30/90-day trends: current window > previous window
 *   – Dream Duration: mix of short and long-running dreams
 *   – Challenge Breakdown: all 7 challenge types represented
 */

export const SHOWCASE_UID = "JnD5Rs6XJmhAlZL0fZ9PK0fPwmJ2";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
/** ISO string for a given number of days ago (positive = past) */
function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Dreams + milestones
// ---------------------------------------------------------------------------
const dreams: any[] = [
  // ── Dream 1: "Launch my SaaS product" – active, 8 milestones, 6 completed
  {
    thread_id: "showcase_dream_1",
    dream: "Launch my SaaS product",
    status: "active",
    category: "career",
    created_at: daysAgo(60),
    updated_at: daysAgo(0),
    dream_card_bg: "#374151",
    metadata: { score: 240, total_xp: 340 },
    roadmap: {
      status: "active",
      milestones: [
        { id: "m1_1", title: "Define target audience & value prop", challenge_type: "knowledge_quest", status: "completed", xp_points: 40, updated_at: daysAgo(55), streak_eligible: true },
        { id: "m1_2", title: "Sketch wireframes for core flow", challenge_type: "skill_flex", status: "completed", xp_points: 35, updated_at: daysAgo(48), streak_eligible: true },
        { id: "m1_3", title: "Set up dev environment & CI pipeline", challenge_type: "prep_ritual", status: "completed", xp_points: 30, updated_at: daysAgo(40), streak_eligible: true },
        { id: "m1_4", title: "Build auth & onboarding flow", challenge_type: "power_move", status: "completed", xp_points: 45, updated_at: daysAgo(28), streak_eligible: true },
        { id: "m1_5", title: "Write first 3 paying-customer emails", challenge_type: "courage_check", status: "completed", xp_points: 40, updated_at: daysAgo(14), streak_eligible: true },
        { id: "m1_6", title: "Run a 5-person usability test", challenge_type: "decision_point", status: "completed", xp_points: 50, updated_at: daysAgo(1), streak_eligible: true }, // Wed Feb 4 – this week
        { id: "m1_7", title: "Integrate Stripe billing", challenge_type: "skill_flex", status: "in_progress", xp_points: 50, updated_at: daysAgo(1), streak_eligible: true },
        { id: "m1_8", title: "Ship public beta & celebrate", challenge_type: "celebration_moment", status: "not_started", xp_points: 50, updated_at: daysAgo(1), streak_eligible: false },
      ],
    },
  },

  // ── Dream 2: "Run a half marathon" – completed, 7 milestones all done
  {
    thread_id: "showcase_dream_2",
    dream: "Run a half marathon",
    status: "completed",
    category: "health",
    created_at: daysAgo(90),
    updated_at: daysAgo(5),
    dream_card_bg: "#1e3a5f",
    metadata: { score: 310, total_xp: 310 },
    roadmap: {
      status: "completed",
      milestones: [
        { id: "m2_1", title: "Research training plans", challenge_type: "knowledge_quest", status: "completed", xp_points: 30, updated_at: daysAgo(85), streak_eligible: true },
        { id: "m2_2", title: "Buy proper running shoes", challenge_type: "prep_ritual", status: "completed", xp_points: 25, updated_at: daysAgo(80), streak_eligible: true },
        { id: "m2_3", title: "Complete first 5 km run", challenge_type: "power_move", status: "completed", xp_points: 40, updated_at: daysAgo(70), streak_eligible: true },
        { id: "m2_4", title: "Log 3 consecutive training days", challenge_type: "skill_flex", status: "completed", xp_points: 45, updated_at: daysAgo(55), streak_eligible: true },
        { id: "m2_5", title: "Run 10 km without stopping", challenge_type: "courage_check", status: "completed", xp_points: 50, updated_at: daysAgo(35), streak_eligible: true },
        { id: "m2_6", title: "Decide on race day nutrition plan", challenge_type: "decision_point", status: "completed", xp_points: 40, updated_at: daysAgo(20), streak_eligible: true },
        { id: "m2_7", title: "Cross that finish line!", challenge_type: "celebration_moment", status: "completed", xp_points: 80, updated_at: daysAgo(5), streak_eligible: false },
      ],
    },
  },

  // ── Dream 3: "Learn Spanish to conversational level" – active, 6 milestones, 3 completed
  {
    thread_id: "showcase_dream_3",
    dream: "Learn Spanish to conversational level",
    status: "active",
    category: "learning",
    created_at: daysAgo(45),
    updated_at: daysAgo(0),
    dream_card_bg: "#2d1b69",
    metadata: { score: 120, total_xp: 270 },
    roadmap: {
      status: "active",
      milestones: [
        { id: "m3_1", title: "Set up Anki deck & daily habit", challenge_type: "prep_ritual", status: "completed", xp_points: 30, updated_at: daysAgo(42), streak_eligible: true },
        { id: "m3_2", title: "Master 200 common words", challenge_type: "knowledge_quest", status: "completed", xp_points: 40, updated_at: daysAgo(30), streak_eligible: true },
        { id: "m3_3", title: "Complete 10 Duolingo lessons in a week", challenge_type: "power_move", status: "completed", xp_points: 50, updated_at: daysAgo(2), streak_eligible: true }, // Tue Feb 3 – this week
        { id: "m3_4", title: "Have a 5-min chat with a native speaker", challenge_type: "courage_check", status: "in_progress", xp_points: 60, updated_at: daysAgo(1), streak_eligible: true },
        { id: "m3_5", title: "Watch a Spanish show with subtitles", challenge_type: "skill_flex", status: "not_started", xp_points: 50, updated_at: daysAgo(1), streak_eligible: true },
        { id: "m3_6", title: "Order food in Spanish at a restaurant", challenge_type: "celebration_moment", status: "not_started", xp_points: 90, updated_at: daysAgo(1), streak_eligible: false },
      ],
    },
  },

  // ── Dream 4: "Save $5 000 emergency fund" – active, 5 milestones, 4 completed
  {
    thread_id: "showcase_dream_4",
    dream: "Save $5,000 emergency fund",
    status: "active",
    category: "financial",
    created_at: daysAgo(75),
    updated_at: daysAgo(0),
    dream_card_bg: "#1a3c2a",
    metadata: { score: 195, total_xp: 235 },
    roadmap: {
      status: "active",
      milestones: [
        { id: "m4_1", title: "Audit monthly expenses", challenge_type: "knowledge_quest", status: "completed", xp_points: 35, updated_at: daysAgo(72), streak_eligible: true },
        { id: "m4_2", title: "Cut 2 unnecessary subscriptions", challenge_type: "decision_point", status: "completed", xp_points: 40, updated_at: daysAgo(60), streak_eligible: true },
        { id: "m4_3", title: "Set up auto-transfer to savings", challenge_type: "prep_ritual", status: "completed", xp_points: 45, updated_at: daysAgo(50), streak_eligible: true },
        { id: "m4_4", title: "Hit $2 500 milestone", challenge_type: "power_move", status: "completed", xp_points: 75, updated_at: daysAgo(1), streak_eligible: true }, // Wed Feb 4 – this week
        { id: "m4_5", title: "Reach $5 000 and celebrate!", challenge_type: "celebration_moment", status: "not_started", xp_points: 80, updated_at: daysAgo(1), streak_eligible: false },
      ],
    },
  },

  // ── Dream 5: "Read 12 books this year" – active, 5 milestones, 3 completed
  {
    thread_id: "showcase_dream_5",
    dream: "Read 12 books this year",
    status: "active",
    category: "personal",
    created_at: daysAgo(35),
    updated_at: daysAgo(0),
    dream_card_bg: "#3b1f5e",
    metadata: { score: 110, total_xp: 240 },
    roadmap: {
      status: "active",
      milestones: [
        { id: "m5_1", title: "Pick books for Q1", challenge_type: "decision_point", status: "completed", xp_points: 30, updated_at: daysAgo(33), streak_eligible: true },
        { id: "m5_2", title: "Finish Book 1 – atomic habits", challenge_type: "knowledge_quest", status: "completed", xp_points: 50, updated_at: daysAgo(22), streak_eligible: true },
        { id: "m5_3", title: "Write a 1-paragraph reflection on Book 1", challenge_type: "skill_flex", status: "completed", xp_points: 30, updated_at: daysAgo(0), streak_eligible: true }, // Thu Feb 5 – today
        { id: "m5_4", title: "Finish Book 2", challenge_type: "power_move", status: "in_progress", xp_points: 50, updated_at: daysAgo(0), streak_eligible: true },
        { id: "m5_5", title: "Host a mini book-club chat", challenge_type: "celebration_moment", status: "not_started", xp_points: 80, updated_at: daysAgo(0), streak_eligible: false },
      ],
    },
  },

  // ── Dream 6: "Travel to Japan" – active, 4 milestones, 2 completed  (adds Mon Feb 2 hit)
  {
    thread_id: "showcase_dream_6",
    dream: "Travel to Japan solo",
    status: "active",
    category: "travel",
    created_at: daysAgo(20),
    updated_at: daysAgo(0),
    dream_card_bg: "#1e1b4b",
    metadata: { score: 70, total_xp: 190 },
    roadmap: {
      status: "active",
      milestones: [
        { id: "m6_1", title: "Research visa & flight options", challenge_type: "knowledge_quest", status: "completed", xp_points: 35, updated_at: daysAgo(18), streak_eligible: true },
        { id: "m6_2", title: "Book flights & first hotel", challenge_type: "decision_point", status: "completed", xp_points: 35, updated_at: daysAgo(3), streak_eligible: true }, // Mon Feb 2 – this week
        { id: "m6_3", title: "Create a 10-day itinerary", challenge_type: "prep_ritual", status: "in_progress", xp_points: 60, updated_at: daysAgo(1), streak_eligible: true },
        { id: "m6_4", title: "Land in Tokyo!", challenge_type: "celebration_moment", status: "not_started", xp_points: 60, updated_at: daysAgo(0), streak_eligible: false },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------
const streak = {
  current_streak: 12,
  longest_streak: 14,
  last_completion_date: "2026-02-05",
  total_completions: 27,
  streak_freeze_available: true,
  milestone_achievements: {
    three_day_count: 4,
    seven_day_count: 2,
    thirty_day_count: 0,
  },
};

// ---------------------------------------------------------------------------
// Exported helpers consumed by api.ts
// ---------------------------------------------------------------------------

/** Full userData payload for fetchUserData */
export function getShowcaseUserData(): any {
  return {
    user_id: SHOWCASE_UID,
    firstname: "Alex",
    lastname: "Demo",
    email: "alex.demo@packslight.com",
    created_at: daysAgo(90),
    streak,
    dreams,
    recents: ["showcase_dream_1", "showcase_dream_5", "showcase_dream_3"],
    up_next: {
      milestone_id: "m1_7",
      milestone_title: "Integrate Stripe billing",
      dream_thread_id: "showcase_dream_1",
      dream_title: "Launch my SaaS product",
      time_estimate: "2 hours",
      xp_points: 50,
      challenge_type: "skill_flex",
      streak_eligible: true,
      updated_at: daysAgo(1),
    },
  };
}

/** Dreams-list response for fetchDreamsList (summary mode) */
export function getShowcaseDreamsList(): any {
  return {
    dreams: dreams.map((d) => ({
      thread_id: d.thread_id,
      dream: d.dream,
      status: d.status,
      category: d.category,
      created_at: d.created_at,
      updated_at: d.updated_at,
      dream_card_bg: d.dream_card_bg,
      milestones_count: d.roadmap.milestones.length,
      completed_milestones_count: d.roadmap.milestones.filter((m: any) => m.status === "completed").length,
      isComplete: d.status === "completed",
    })),
    pagination: { page: 1, limit: 10, total: dreams.length, totalPages: 1 },
  };
}

/** Single-dream detail response for fetchDreamDetails */
export function getShowcaseDreamDetail(threadId: string): any | null {
  return dreams.find((d) => d.thread_id === threadId) ?? null;
}
