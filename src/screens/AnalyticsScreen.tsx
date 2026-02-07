import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BottomNavbar } from "../components/BottomNavbar";
import { StreakBadge } from "../components/streak/StreakBadge";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  getThemeColors,
  ChallengeTypeColors,
  ChallengeTypeName,
} from "../constants/GlobalStyles";
import PieChart from "react-native-pie-chart";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type TimeRange = 7 | 30 | 90;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** ISO date → JS Date (safe on all platforms) */
const toDate = (iso: string): Date => new Date(iso.replace("Z", "+00:00"));

/** Day-of-week index normalised to Mon=0 … Sun=6 */
const dowMon = (d: Date): number => (d.getDay() + 6) % 7;

/**
 * Walk every milestone across every dream and return the ones that have a
 * completion timestamp within the given number of days (looking back from now).
 */
function getCompletedMilestones(dreams: any[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const results: any[] = [];
  for (const dream of dreams) {
    if (!dream.roadmap?.milestones) continue;
    for (const m of dream.roadmap.milestones) {
      if (m.status !== "completed") continue;
      // Use updated_at as the completion timestamp
      const ts = m.updated_at ? toDate(m.updated_at).getTime() : NaN;
      if (ts >= cutoff) {
        results.push({
          ...m,
          _dreamCategory: dream.category,
          _dreamCreatedAt: dream.created_at,
          _dreamTitle: dream.dream,
        });
      }
    }
  }
  return results;
}

/** Build 7-slot activity array (Mon-Sun) from a list of completed milestones */
function buildWeeklyBars(milestones: any[]): number[] {
  const bars = [0, 0, 0, 0, 0, 0, 0];
  for (const m of milestones) {
    if (!m.updated_at) continue;
    bars[dowMon(toDate(m.updated_at))]++;
  }
  return bars;
}

/** Count completions in a window [start, end) */
function countInWindow(dreams: any[], startMs: number, endMs: number): number {
  let count = 0;
  for (const dream of dreams) {
    if (!dream.roadmap?.milestones) continue;
    for (const m of dream.roadmap.milestones) {
      if (m.status !== "completed" || !m.updated_at) continue;
      const ts = toDate(m.updated_at).getTime();
      if (ts >= startMs && ts < endMs) count++;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Pill time-range selector */
function TimeRangePills({
  selected,
  onChange,
}: {
  selected: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const options: TimeRange[] = [7, 30, 90];

  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
      {options.map((v) => {
        const active = v === selected;
        return (
          <TouchableOpacity
            key={v}
            activeOpacity={0.7}
            onPress={() => onChange(v)}
            style={[
              styles.pill,
              active
                ? { backgroundColor: "#A855F7" }
                : {
                    backgroundColor:
                      theme === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  },
            ]}>
            <Text
              style={[
                styles.pillText,
                { color: active ? "#fff" : themeColors.text_secondary },
              ]}>
              {v} days
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** XP score card with thin progress bar */
function XPCard({ earnedXP, totalXP }: { earnedXP: number; totalXP: number }) {
  const { theme } = useThemeStore();
  const pct = totalXP > 0 ? Math.min(earnedXP / totalXP, 1) : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#2B2D56" : "#fff" },
      ]}>
      <Text
        style={[
          styles.cardLabel,
          { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
        ]}>
        COURAGE POINTS EARNED
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 12,
        }}>
        <Text style={[styles.bigNumber, { color: "#A855F7" }]}>{earnedXP}</Text>
        <Text
          style={[
            styles.cardLabel,
            { color: theme === "dark" ? "#808080" : "#9CA3AF" },
          ]}>
          / {totalXP} total
        </Text>
      </View>
      {/* Progress bar */}
      <View
        style={[
          styles.progressBg,
          {
            backgroundColor:
              theme === "dark" ? "rgba(255,255,255,0.1)" : "#F3F4F6",
          },
        ]}>
        <LinearGradient
          colors={["#A855F7", "#6366F1"]}
          style={[styles.progressFill, { width: `${pct * 100}%` }]}
        />
      </View>
    </View>
  );
}

/** Weekly activity bar chart */
function WeeklyActivityCard({ bars }: { bars: number[] }) {
  const { theme } = useThemeStore();
  const max = Math.max(...bars, 1);
  const BAR_HEIGHT = 80;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#2B2D56" : "#fff" },
      ]}>
      <Text
        style={[
          styles.cardLabel,
          { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
        ]}>
        WEEKLY ACTIVITY
      </Text>
      <Text style={[styles.bigNumber, { color: "#fff", marginBottom: 16 }]}>
        {bars.reduce((a, b) => a + b, 0)} completions
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 6,
          height: BAR_HEIGHT + 20,
        }}>
        {bars.map((val, i) => {
          const h = (val / max) * BAR_HEIGHT;
          const isToday = i === dowMon(new Date());
          return (
            <View
              key={i}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "flex-end",
                height: BAR_HEIGHT + 20,
              }}>
              <View style={{ height: BAR_HEIGHT, justifyContent: "flex-end" }}>
                {val > 0 ? (
                  <LinearGradient
                    colors={
                      isToday
                        ? ["#A855F7", "#C084FC"]
                        : ["rgba(168,85,247,0.5)", "rgba(168,85,247,0.3)"]
                    }
                    style={[
                      styles.bar,
                      { height: h, borderRadius: h > 12 ? 6 : 4 },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.bar,
                      {
                        height: 4,
                        borderRadius: 2,
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "#E5E7EB",
                      },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  { color: theme === "dark" ? "#808080" : "#9CA3AF" },
                ]}>
                {DAY_LABELS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Streak & Achievements section */
function StreakCard({
  streakData,
  onPress,
}: {
  streakData: any;
  onPress: () => void;
}) {
  const { theme } = useThemeStore();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme === "dark" ? "#2B2D56" : "#fff" },
        ]}>
        <Text
          style={[
            styles.cardLabel,
            { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
          ]}>
          STREAK & ACHIEVEMENTS
        </Text>
        {/* 3-stat row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <LinearGradient
            colors={["#A855F7", "#6366F1"]}
            style={[styles.statPill, { flex: 1 }]}>
            <Text style={styles.statPillIcon}>{'\u{1F525}'}</Text>
            <Text style={styles.statPillNum}>{streakData.current_streak}</Text>
            <Text style={styles.statPillSub}>Current</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#A855F7", "#6366F1"]}
            style={[styles.statPill, { flex: 1 }]}>
            <Text style={styles.statPillIcon}>{'\u{1F3C6}'}</Text>
            <Text style={styles.statPillNum}>{streakData.longest_streak}</Text>
            <Text style={styles.statPillSub}>Best</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#A855F7", "#6366F1"]}
            style={[styles.statPill, { flex: 1 }]}>
            <Text style={styles.statPillIcon}>{'\u{2705}'}</Text>
            <Text style={styles.statPillNum}>
              {streakData.total_completions}
            </Text>
            <Text style={styles.statPillSub}>Total</Text>
          </LinearGradient>
        </View>
        {/* Achievements */}
        {[
          {
            label: "3-Day Streaks",
            count: streakData.milestone_achievements.three_day_count,
            icon: '\u{1F525}',
          },
          {
            label: "7-Day Streaks",
            count: streakData.milestone_achievements.seven_day_count,
            icon: '\u{1F3C6}',
          },
          {
            label: "30-Day Streaks",
            count: streakData.milestone_achievements.thirty_day_count,
            icon: '\u{1F451}',
          },
        ].map((a) => (
          <View
            key={a.label}
            style={[
              styles.achievementRow,
              {
                borderBottomColor:
                  theme === "dark" ? "rgba(255,255,255,0.08)" : "#F3F4F6",
                borderBottomWidth: 1,
              },
            ]}>
            <Text style={{ fontSize: 24 }}>{a.icon}</Text>
            <Text
              style={[
                styles.achievementLabel,
                { color: theme === "dark" ? "#fff" : "#1F2937", flex: 1 },
              ]}>
              {a.label}
            </Text>
            <Text
              style={[
                styles.achievementCount,
                { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
              ]}>
              {a.count}x
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

/** Completion Trend card (current window vs previous) */
function CompletionTrendCard({
  current,
  previous,
  range,
}: {
  current: number;
  previous: number;
  range: TimeRange;
}) {
  const { theme } = useThemeStore();
  const diff = current - previous;
  const up = diff >= 0;

  return (
    <LinearGradient
      colors={up ? ["#EC4899", "#F472B6"] : ["#6366F1", "#818CF8"]}
      style={[styles.card, { padding: 18 }]}>
      <Text style={[styles.cardLabel, { color: "rgba(255,255,255,0.75)" }]}>
        COMPLETION TREND
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text style={[styles.bigNumber, { color: "#fff" }]}>{current}</Text>
        <Text style={{ color: "#fff", fontSize: 22 }}>{up ? "↑" : "↓"}</Text>
      </View>
      <Text
        style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 13,
          marginTop: 4,
          fontFamily: "InstrumentSans-Regular",
        }}>
        {Math.abs(diff)} {up ? "more" : "fewer"} than previous {range} days
      </Text>
    </LinearGradient>
  );
}

/** Best day of the week card */
function BestDayCard({ bars }: { bars: number[] }) {
  const { theme } = useThemeStore();
  const maxIdx = bars.indexOf(Math.max(...bars));
  const hasAny = bars.some((b) => b > 0);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#2B2D56" : "#fff" },
      ]}>
      <Text
        style={[
          styles.cardLabel,
          { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
        ]}>
        BEST DAY
      </Text>
      {hasAny ? (
        <>
          <Text style={[styles.bigNumber, { color: "#A855F7" }]}>
            {DAY_LABELS[maxIdx]}
          </Text>
          <Text
            style={[
              {
                color: theme === "dark" ? "#b0b0b0" : "#6B7280",
                fontSize: 14,
                fontFamily: "InstrumentSans-Regular",
              },
            ]}>
            {bars[maxIdx]} completion{bars[maxIdx] !== 1 ? "s" : ""} this week
          </Text>
        </>
      ) : (
        <Text
          style={[
            {
              color: theme === "dark" ? "#808080" : "#9CA3AF",
              fontSize: 14,
              fontFamily: "InstrumentSans-Regular",
            },
          ]}>
          No completions yet this week
        </Text>
      )}
    </View>
  );
}

/** Dream duration card */
function DreamDurationCard({ dreams }: { dreams: any[] }) {
  const { theme } = useThemeStore();

  const items = useMemo(() => {
    return dreams.map((d) => {
      const start = d.created_at ? toDate(d.created_at) : null;
      // latest milestone updated_at or now
      let latestMs = 0;
      if (d.roadmap?.milestones) {
        for (const m of d.roadmap.milestones) {
          if (m.updated_at) {
            const t = toDate(m.updated_at).getTime();
            if (t > latestMs) latestMs = t;
          }
        }
      }
      const end = latestMs > 0 ? new Date(latestMs) : new Date();
      const days = start
        ? Math.max(
            1,
            Math.round(
              (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
            ),
          )
        : null;
      return {
        title: d.dream || "Dream",
        days,
        status: d.status,
        category: d.category,
      };
    });
  }, [dreams]);

  if (items.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#2B2D56" : "#fff" },
      ]}>
      <Text
        style={[
          styles.cardLabel,
          { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
        ]}>
        DREAM DURATION
      </Text>
      {items.map((item, i) => (
        <View
          key={i}
          style={[
            styles.durationRow,
            i < items.length - 1 && {
              borderBottomColor:
                theme === "dark" ? "rgba(255,255,255,0.08)" : "#F3F4F6",
              borderBottomWidth: 1,
            },
          ]}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                {
                  color: theme === "dark" ? "#fff" : "#1F2937",
                  fontSize: 15,
                  fontWeight: "600",
                  fontFamily: "InstrumentSans-SemiBold",
                },
              ]}
              numberOfLines={1}>
              {item.title}
            </Text>
            <Text
              style={[
                {
                  color: theme === "dark" ? "#808080" : "#9CA3AF",
                  fontSize: 12,
                  fontFamily: "InstrumentSans-Regular",
                },
              ]}>
              {item.status === "completed" ? "Completed" : "In progress"}
            </Text>
          </View>
          <Text
            style={[
              {
                color: "#A855F7",
                fontSize: 18,
                fontWeight: "700",
                fontFamily: "InstrumentSans-Bold",
              },
            ]}>
            {item.days != null ? `${item.days}d` : "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Challenge type breakdown doughnut chart */
function ChallengeBreakdownCard({ milestones }: { milestones: any[] }) {
  const { theme } = useThemeStore();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of milestones) {
      const ct = m.challenge_type || "unknown";
      map[ct] = (map[ct] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [milestones]);

  if (milestones.length === 0) return null;

  const slices = counts.map(([ct, count]) => ({
    value: count,
    color: (ChallengeTypeColors as any)[ct] || "#A855F7",
  }));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme === "dark" ? "#2B2D56" : "#fff" },
      ]}>
      <Text
        style={[
          styles.cardLabel,
          { color: theme === "dark" ? "#b0b0b0" : "#6B7280" },
        ]}>
        CHALLENGE TYPES
      </Text>
      {/* Doughnut chart */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <PieChart
          widthAndHeight={160}
          series={slices}
          cover={{ radius: 0.6, color: theme === "dark" ? "#2B2D56" : "#fff" }}
        />
      </View>
      {/* Legend */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {counts.map(([ct, count]) => {
          const color = (ChallengeTypeColors as any)[ct] || "#A855F7";
          const label = (ChallengeTypeName as any)[ct] || ct;
          return (
            <View
              key={ct}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: color,
                }}
              />
              <Text
                style={[
                  {
                    color: theme === "dark" ? "#b0b0b0" : "#6B7280",
                    fontSize: 12,
                    fontFamily: "InstrumentSans-Regular",
                  },
                ]}>
                {label} ({count})
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
interface AnalyticsScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  onNavigate,
}) => {
  const { userData } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  const dreams: any[] = userData?.dreams || [];
  const streakData = userData?.streak;

  // --- XP totals (all-time, not time-gated) ---
  const { earnedXP, totalXP } = useMemo(() => {
    let earned = 0,
      total = 0;
    for (const d of dreams) {
      if (d.metadata?.score != null) {
        earned += d.metadata.score;
        total += d.metadata.total_xp || 0;
      } else if (d.roadmap?.milestones) {
        for (const m of d.roadmap.milestones) {
          total += m.xp_points || 0;
          if (m.status === "completed") earned += m.xp_points || 0;
        }
      } else if (d._metadata) {
        // Summary-only fallback — we don't have per-milestone XP, skip total
        earned += 0;
      }
    }
    return { earnedXP: earned, totalXP: total };
  }, [dreams]);

  // --- Weekly activity bars (always 7-day window) ---
  const weeklyBars = useMemo(
    () => buildWeeklyBars(getCompletedMilestones(dreams, 7)),
    [dreams],
  );

  // --- Completion trend: current window vs previous window of same size ---
  const { currentCount, previousCount } = useMemo(() => {
    const now = Date.now();
    const windowMs = timeRange * 24 * 60 * 60 * 1000;
    return {
      currentCount: countInWindow(dreams, now - windowMs, now),
      previousCount: countInWindow(dreams, now - 2 * windowMs, now - windowMs),
    };
  }, [dreams, timeRange]);

  // --- All completed milestones (for challenge breakdown) ---
  const allCompleted = useMemo(() => {
    const res: any[] = [];
    for (const d of dreams) {
      if (!d.roadmap?.milestones) continue;
      for (const m of d.roadmap.milestones) {
        if (m.status === "completed") res.push(m);
      }
    }
    return res;
  }, [dreams]);

  const bottomPadding = 60 + Math.max(insets.bottom, 8) + 20;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      <BottomNavbar onNavigate={onNavigate} activeTab="analytics" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Header row: title + streak chip */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}>
          <Text
            style={[styles.screenTitle, { color: themeColors.text_primary }]}>
            Analytics
          </Text>
          {streakData && streakData.current_streak > 0 && (
            <StreakBadge
              streakCount={streakData.current_streak}
              size="medium"
            />
          )}
        </View>

        {/* Time range pills */}
        <TimeRangePills selected={timeRange} onChange={setTimeRange} />

        {/* XP Card */}
        <XPCard earnedXP={earnedXP} totalXP={totalXP} />

        {/* Weekly Activity */}
        <WeeklyActivityCard bars={weeklyBars} />

        {/* Streak & Achievements */}
        {streakData ? (
          <StreakCard
            streakData={streakData}
            onPress={() => onNavigate("StreakStats")}
          />
        ) : null}

        {/* Completion Trend */}
        <CompletionTrendCard
          current={currentCount}
          previous={previousCount}
          range={timeRange}
        />

        {/* Best Day */}
        <BestDayCard bars={weeklyBars} />

        {/* Dream Duration */}
        <DreamDurationCard dreams={dreams} />

        {/* Challenge Type Breakdown */}
        <ChallengeBreakdownCard milestones={allCompleted} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "InstrumentSans-Bold",
  },
  // --- pills ---
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
  },
  // --- card shell ---
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontFamily: "InstrumentSans-Bold",
    marginBottom: 8,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: "800",
    fontFamily: "InstrumentSans-Bold",
  },
  // --- progress bar ---
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  // --- weekly bars ---
  bar: {
    width: "100%",
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: "InstrumentSans-Regular",
    marginTop: 6,
    textAlign: "center",
  },
  // --- streak stat pills ---
  statPill: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statPillIcon: {
    fontSize: 22,
  },
  statPillNum: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "InstrumentSans-Bold",
  },
  statPillSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "InstrumentSans-Regular",
  },
  // --- achievement rows ---
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  achievementLabel: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
  },
  achievementCount: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
  },
  // --- dream duration rows ---
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
});
