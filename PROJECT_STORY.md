# LaunchPad: Dream to Done

## Inspiration

We've all had dreams that felt too big to start. The gap between *wanting* something and *doing* something about it is where most dreams die. Existing goal-tracking apps treat dreams like cold to-do lists — transactional and lonely.

We wanted something different: a supportive friend that breaks your biggest ambitions into bite-sized challenges, celebrates every win, and connects you with a community chasing their own dreams.

LaunchPad was born from one question: *What if achieving your dreams could feel like a game you actually want to play?*

## What it does

**Luna AI** guides users through articulating their dream and generates a structured roadmap of milestones, each with a challenge type, XP value, and time estimate.

**7 Challenge Types** keep things dynamic — Power Moves, Knowledge Quests, Courage Checks, Skill Flexes, Decision Points, Celebration Moments, and Prep Rituals.

**Streaks & XP** drive daily habits. Streaks increment on each new day a milestone is completed:

$$S(t) = \begin{cases} S(t-1) + 1 & \text{if completion on day } t \\ 0 & \text{otherwise} \end{cases}$$

Each milestone carries $x_m \in [10, 50]$ XP, and progress is:

$$P = \left\lfloor \frac{|M_{\text{completed}}|}{|M|} \times 100 \right\rfloor \%$$

**Community** — Share Victory Cards and Journey Recaps. Others respond with Courage Boosts, Permission Slips, and Me Too reactions.

**Analytics (Premium)** — Weekly activity, completion trends, challenge breakdowns, and streak achievements across 7/30/90-day windows.

**Freemium model** via RevenueCat: 2 dreams free, Premium unlocks 3 active dreams + full analytics.

## How we built it

React Native + Expo SDK 54, single TypeScript codebase for iOS and Android.

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 + Expo ~54.0.33 |
| Language | TypeScript ~5.9.2 |
| State | Zustand 5.0.10 (6 stores) |
| Navigation | React Navigation 7 |
| Auth | Firebase 12.8.0 + Google Sign-In |
| Backend | MongoDB via REST API |
| Monetization | RevenueCat 9.7.5 |
| Animations | Lottie + Reanimated 4.1 |

Luna streams responses via SSE. Milestones auto-chain into sequential dependencies:

$$m_i.\text{dependencies} = \{m_{i-1}\}, \quad \forall \; i \in [2, n]$$

Field-optimized fetching loads `minimal`, `essential`, or `full` user data depending on context, with full roadmaps fetched in the background.

## Challenges we ran into

**Data consistency** — User data across Firebase Auth, MongoDB users, and a dreams collection. We solved it with optimistic UI updates, fire-and-forget syncs, and designating the dreams collection as the single source of truth.

**Streak integrity** — Custom milestones are flagged `streak_eligible: false` to prevent gaming. Streak-break detection runs on every login with timezone-aware date handling.

**SSE in React Native** — `EventSource` isn't natively supported. We built custom stream parsing to progressively render Luna's AI replies without blocking the UI thread.

**Cross-platform polish** — Notification permissions, Google Sign-In, adaptive icons, and haptic feedback all behave differently across iOS and Android.

**Premium gating** — RevenueCat entitlement checks at login, navigation, and periodically — cached in the auth store so the UI never blocks on a network call.

## Accomplishments that we're proud of

- Built a **complete AI-to-action pipeline** — from natural language conversation to a structured, gamified roadmap in a single flow
- Designed a **gamification system grounded in behavioral psychology** — streaks, XP, 7 challenge types, and community validation that genuinely drives engagement
- Shipped a **polished cross-platform app** from a single codebase that feels native on both iOS and Android
- Created a **community layer** with Victory Cards, Journey Recaps, Permission Slips, and Courage Boosts that makes goal-tracking a shared experience instead of a solitary one
- Implemented **field-optimized data fetching** that keeps the app snappy — essential data loads instantly while full roadmaps hydrate in the background

## What we learned

**Motivation is system design, not willpower.** Streaks tap into loss aversion. XP gives tangible progress. Challenge variety prevents monotony. The right system makes consistency feel natural.

**Pick your source of truth early.** When data lives in multiple places, confusion is inevitable. We learned the hard way to designate one collection as authoritative and treat everything else as a cache.

**Zustand scales beautifully.** Six stores, zero boilerplate. Clean separation of auth, app state, community, notifications, voice, and theming without the overhead of Redux.

**Optimistic updates change everything.** Updating the UI before the API confirms makes the app feel instant. The tradeoff is complexity in error handling, but it's worth it.

## What's next for LaunchPad: Dream to Done

- **Streak Freezes** — Premium users can preserve streaks on off days without breaking their chain
- **AI Milestone Refinement** — Let Luna adapt roadmaps based on progress, adjusting difficulty and pacing dynamically
- **Group Dreams** — Collaborative goals where friends share a roadmap and hold each other accountable
- **Voice Journaling** — Reflect on milestones with voice notes that capture the emotion behind the achievement
- **Leaderboards & Seasons** — Community-wide challenges with seasonal themes and friendly competition
- **iOS App Store & Google Play Launch** — Ship v1.0 to the public

---

*Built with React Native, Expo, Firebase, Zustand, RevenueCat, and a whole lot of courage.*
