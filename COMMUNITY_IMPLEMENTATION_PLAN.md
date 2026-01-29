# Community Feature Implementation Plan

## Overview

The Community (called "Victory Wall") is designed to combat comparison culture and keep users focused on **proof of action, not perfection**. Users share completed milestones as Victory Cards, interact through Courage Boosts and Permission Slips, and find inspiration from women on similar journeys.

**Core Principle:** Share AFTER you do the thing, never before. No "I'm going to" posts—only "I DID" posts.

---

## Three-Phase Implementation

### Phase 1: Core Victory Wall (MVP)
- Victory Cards (auto-generated milestone shares)
- Courage Boosts (interaction system)
- Basic feed with filtering

### Phase 2: Enhanced Interactions
- Permission Slips (templated responses)
- Journey Recaps (completed dream shares)
- Evidence Posts (detailed victory stories)
- "Me Too" solidarity feature

### Phase 3: Advanced Features
- "Just Like Me" personalized algorithm
- Weekly community stats
- Category and impact-level filters

**Note:** Community Challenges, Leaderboards, Content Moderation, and Monetization will be implemented in future phases outside this specification.

---

# PHASE 1: Core Victory Wall (MVP)

## Goal
Get users sharing completed milestones and interacting through courage boosts. Create the basic feed experience.

---

## 1.1 Victory Cards (Auto-Generated)

### What It Is
When a user completes a milestone, they have the option to share it to the Victory Wall as a pre-formatted card.

### Data Model

```typescript
interface VictoryCard {
  id: string;
  userId: string;
  userDisplayName: string; // "Sarah" or "Anonymous"
  userLocation?: string; // "Chicago, IL" (optional)
  userAge?: number; // 32 (optional)
  
  // Milestone details
  milestoneId: string;
  milestoneTitle: string; // "Booked my Bali flight"
  dreamTitle: string; // "Solo Trip to Bali"
  dreamCategory: 
    | 'career_professional'      // Career & Professional Growth
    | 'personal_development'     // Personal Development & Learning
    | 'health_wellness'          // Health & Wellness
    | 'creative_expression'      // Creative Expression
    | 'relationships_community'  // Relationships & Community
    | 'travel_exploration'       // Travel & Exploration
    | 'finance_security'         // Finance & Security
    | 'lifestyle_hobbies'        // Lifestyle & Hobbies
    | 'courage_challenges'       // Courage Challenges
    | 'achievement_goals';       // Achievement Goals
  
  // Victory details
  evidenceSnippet: string; // User's proof/notes (max 200 chars)
  confidenceBoost: number; // 5-50
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  
  // Metadata
  completedDate: string; // ISO date
  createdAt: string; // ISO date (when posted to wall)
  
  // Interactions
  courageBoosts: number; // Count of boosts received
  permissionSlips: PermissionSlip[]; // Array of permissions given
  meTooCount: number; // Count of "Me Too" clicks
}
```

### Victory Card Visual Design

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ✓ VICTORY                     [Category Icon]│
├─────────────────────────────────────────────┤
│                                             │
│  MILESTONE TITLE IN CAPS                    │
│                                             │
│  Part of: Dream Title                       │
│  Category: [BADGE]                          │
│                                             │
│  "Evidence snippet goes here.               │
│  User's own words about what they did."     │
│                                             │
│  +35% Confidence | Jan 28, 2026             │
│                                             │
│  — Sarah, 32, Chicago                       │
│                                             │
├─────────────────────────────────────────────┤
│ [⚡ 12 Boosts] [💬 5 Permissions] [👥 23 Me Too]│
└─────────────────────────────────────────────┘
```

**Design Specifications:**

- **Background:** White with subtle gradient based on category color
- **Border:** 2px solid in category color
- **Checkmark:** Category color, 24px
- **Title:** 24px bold, uppercase, gray-900
- **Evidence:** 16px regular, gray-700, italic
- **Stats:** 14px, category color for confidence boost
- **User info:** 12px, gray-500
- **Rounded corners:** 16px

**Category Colors:**
```javascript
const categoryColors = {
  career_professional: '#2D5BFF',      // Blue - Career & Professional Growth
  personal_development: '#7B61FF',     // Purple - Personal Development & Learning
  health_wellness: '#FF006E',          // Pink - Health & Wellness
  creative_expression: '#FF5C00',      // Orange - Creative Expression
  relationships_community: '#10B981',  // Green - Relationships & Community
  travel_exploration: '#00B4D8',       // Teal - Travel & Exploration
  finance_security: '#F59E0B',         // Amber - Finance & Security
  lifestyle_hobbies: '#8B5CF6',        // Violet - Lifestyle & Hobbies
  courage_challenges: '#EF4444',       // Red - Courage Challenges
  achievement_goals: '#F97316'         // Orange-Red - Achievement Goals
};
```

**Category Badges:**
```
[CAREER] [DEVELOPMENT] [WELLNESS] [CREATIVE] [RELATIONSHIPS] 
[TRAVEL] [FINANCE] [LIFESTYLE] [COURAGE] [ACHIEVEMENT]
```
Small pill-shaped badge with white text on category color background.

### Victory Card Creation Flow

**When user completes a milestone:**

1. Celebration screen appears with confetti
2. "Share your victory?" button appears
3. If clicked, show Victory Card preview:
   - Pre-filled with milestone data
   - Evidence snippet pre-populated from milestone evidence field
   - User can edit evidence snippet (max 200 chars)
   - User can toggle "Share anonymously" (hides name/location/age)
4. "Post to Victory Wall" button
5. Success message: "Your victory is live! You've inspired the community."

**Implementation Notes:**
- Victory Cards are optional (user can skip sharing)
- Evidence snippet defaults to milestone evidence but can be edited for brevity
- Anonymous mode: Shows "A woman" instead of name, no location/age
- Posted date is separate from completed date (can share retroactively)

---

## 1.2 Victory Wall Feed

### Feed Structure

**Layout:**
- Vertical scrolling feed (like Instagram/Twitter)
- Cards displayed full-width (mobile) or max-width 600px (desktop)
- Infinite scroll or paginated (20 cards per page)
- Most recent at top (chronological order)

**Empty State:**
```
┌─────────────────────────────────────────┐
│                                         │
│           🎯                            │
│                                         │
│    The Victory Wall is waiting          │
│    for YOUR proof.                      │
│                                         │
│    Complete a milestone and share       │
│    your win to inspire the community.   │
│                                         │
│    [Go to My Dreams]                    │
│                                         │
└─────────────────────────────────────────┘
```

**Header:**
```
Victory Wall

Filter: [All Categories ▼]  [All Dreams]  [This Week ▼]

─────────────────────────────────────────────
```

### Basic Filtering (Phase 1)

**Filter by Category:**
- All Categories (default)
- Career & Professional Growth
- Personal Development & Learning
- Health & Wellness
- Creative Expression
- Relationships & Community
- Travel & Exploration
- Finance & Security
- Lifestyle & Hobbies
- Courage Challenges
- Achievement Goals

**Implementation:**
Simple dropdown that filters feed by `dreamCategory` field.

**Filter by Time:**
- All Time (default)
- This Week
- This Month

**Implementation:**
Filter by `completedDate` field.

---

## 1.3 Courage Boosts (Primary Interaction)

### What It Is
Instead of "likes," users give "Courage Boosts" that add real courage points to the poster.

### How It Works

**Visual:**
- Lightning bolt icon ⚡
- Number next to it shows boost count
- Unactivated: Gray outline
- Activated: Filled with amber color (#F59E0B)

**Interaction:**
1. User clicks ⚡ on a Victory Card
2. Icon fills with color + brief animation (scale up/down)
3. Boost count increments by 1
4. Poster receives +1 courage point to their account
5. Toast notification for poster: "Sarah gave you a courage boost! +1 courage point"

**Rules:**
- One boost per victory card per user (can't spam)
- No limit on total boosts given per day (in Phase 1)
- Users can boost their own victories (to remove stigma)

### Data Model

```typescript
interface CourageBoost {
  id: string;
  victoryCardId: string;
  giverId: string; // User who gave the boost
  receiverId: string; // User who posted the victory
  createdAt: string; // ISO date
}

// On VictoryCard
courageBoosts: number; // Total count

// On User profile
couragePointsBalance: number; // Total points earned from all sources
```

### Visual Feedback

**Button States:**
```javascript
// Not boosted (default)
{
  icon: '⚡',
  color: '#9CA3AF', // gray
  backgroundColor: 'transparent',
  border: '2px solid #E5E7EB'
}

// Boosted (after click)
{
  icon: '⚡',
  color: '#FFFFFF',
  backgroundColor: '#F59E0B', // amber
  border: '2px solid #F59E0B',
  animation: 'boost-pulse 0.3s ease-out'
}
```

**Animation:**
```css
@keyframes boost-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

## 1.4 Victory Wall API Endpoints

### GET /api/victories

**Purpose:** Fetch victory cards for feed

**Query Parameters:**
- `category` (optional): Filter by dream category
- `timeframe` (optional): 'week' | 'month' | 'all'
- `page` (optional): Page number for pagination
- `limit` (optional): Cards per page (default 20)

**Response:**
```json
{
  "victories": [
    {
      "id": "vic_123",
      "userId": "user_456",
      "userDisplayName": "Sarah",
      "userLocation": "Chicago, IL",
      "userAge": 32,
      "milestoneTitle": "Booked my Bali flight",
      "dreamTitle": "Solo Trip to Bali",
      "dreamCategory": "travel_exploration",
      "evidenceSnippet": "Paid $847. It's refundable but IT'S REAL.",
      "confidenceBoost": 35,
      "impactLevel": "critical",
      "completedDate": "2026-01-28T10:30:00Z",
      "createdAt": "2026-01-28T11:00:00Z",
      "courageBoosts": 12,
      "permissionSlips": [],
      "meTooCount": 23,
      "hasUserBoosted": false // Whether current user has boosted this
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalCount": 94
  }
}
```

### POST /api/victories

**Purpose:** Create new victory card

**Request Body:**
```json
{
  "milestoneId": "milestone_789",
  "evidenceSnippet": "Custom evidence text (max 200 chars)",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "victoryId": "vic_123",
  "couragePointsAwarded": 5 // Bonus for sharing
}
```

**Business Logic:**
- Pull milestone data (title, dream, category, impact, confidence boost)
- Pull user data (name, location, age) unless `isAnonymous` is true
- Auto-populate evidence from milestone if not provided
- Award +5 courage points for sharing (bonus incentive)

### POST /api/victories/:victoryId/boost

**Purpose:** Give a courage boost

**Request Body:**
```json
{
  "userId": "user_456"
}
```

**Response:**
```json
{
  "success": true,
  "newBoostCount": 13,
  "couragePointsAwarded": 1
}
```

**Business Logic:**
- Check if user has already boosted this victory (return error if duplicate)
- Increment victory's `courageBoosts` count
- Add +1 courage point to poster's account
- Create `CourageBoost` record
- Send notification to poster

---

## 1.5 User Profile Integration

### Victory Stats on Profile

**Display on user profile:**
```
┌────────────────────────────────┐
│  My Community Impact           │
├────────────────────────────────┤
│  Victories Shared: 12          │
│  Courage Boosts Received: 347  │
│  Courage Boosts Given: 89      │
│  People Inspired: 234 (Me Too) │
└────────────────────────────────┘
```

### User's Victory History

**Section on profile:**
- "My Victories" tab
- Shows all victory cards user has posted
- Sorted by most recent
- Click to view individual victory with all interactions

---

## 1.6 Notifications for Phase 1

**Victory-Related Notifications:**

1. **Courage Boost Received:**
   - "Sarah gave you a courage boost! +1 courage point"
   - Links to the specific victory card

2. **Victory Milestone (10, 25, 50, 100 boosts):**
   - "Your victory just hit 25 courage boosts! 🔥"
   - Encourages continued sharing

**Notification Delivery:**
- In-app notification badge
- Optional: Push notifications (if user has enabled)
- Optional: Email digest (daily summary)

---

# PHASE 2: Enhanced Interactions

## Goal
Add richer interaction methods (Permission Slips, Evidence Posts, Journey Recaps) and solidarity features (Me Too).

---

## 2.1 Permission Slips (Templated Responses)

### What It Is
Instead of free-form comments, users give templated "Permission Slips" that continue the app's permission system theme.

### How It Works

**Visual:**
- 💬 icon with count (number of permission slips given)
- Click to open Permission Slip selector

**Permission Slip Options:**

1. "Permission granted to keep going"
2. "Permission granted to be proud of this"
3. "Permission granted to inspire the rest of us"
4. "Permission granted to call yourself [identity]"

**Option 4 is dynamic:**
- For career_professional: "Permission granted to call yourself a leader"
- For personal_development: "Permission granted to call yourself a learner"
- For health_wellness: "Permission granted to call yourself an athlete"
- For creative_expression: "Permission granted to call yourself a creator"
- For relationships_community: "Permission granted to call yourself a connector"
- For travel_exploration: "Permission granted to call yourself a traveler"
- For finance_security: "Permission granted to call yourself financially savvy"
- For lifestyle_hobbies: "Permission granted to call yourself [hobby name]"
- For courage_challenges: "Permission granted to call yourself brave"
- For achievement_goals: "Permission granted to call yourself a champion"

### Data Model

```typescript
interface PermissionSlip {
  id: string;
  victoryCardId: string;
  giverId: string;
  giverDisplayName: string; // "Sarah" or "Anonymous"
  receiverId: string;
  permissionType: 1 | 2 | 3 | 4; // Which template was used
  permissionText: string; // The actual permission statement
  createdAt: string; // ISO date
}
```

### Permission Slip UI

**Selector Modal:**
```
┌─────────────────────────────────────────┐
│  Give Permission                   [✕]  │
├─────────────────────────────────────────┤
│                                         │
│  Choose a permission to grant:          │
│                                         │
│  [ ] Permission granted to keep going   │
│                                         │
│  [ ] Permission granted to be proud     │
│      of this                            │
│                                         │
│  [ ] Permission granted to inspire      │
│      the rest of us                     │
│                                         │
│  [ ] Permission granted to call         │
│      yourself a [traveler]              │
│                                         │
│  [Cancel]              [Grant Permission]│
└─────────────────────────────────────────┘
```

**Display on Victory Card:**
```
💬 5 PERMISSIONS GRANTED

[View All]

Most Recent:
"Permission granted to call yourself a traveler"
— Sarah
```

**Expanded View (Click "View All"):**
```
┌─────────────────────────────────────────┐
│  Permissions Granted               [✕]  │
├─────────────────────────────────────────┤
│                                         │
│  💬 "Permission granted to call         │
│      yourself a traveler"               │
│  — Sarah, 2 hours ago                   │
│                                         │
│  💬 "Permission granted to be proud     │
│      of this"                           │
│  — Anonymous, 5 hours ago               │
│                                         │
│  💬 "Permission granted to keep going"  │
│  — Jessica, 1 day ago                   │
│                                         │
└─────────────────────────────────────────┘
```

### Permission Slip Rewards

**For Giver:**
- No direct reward (pure generosity mechanic)
- Shows count on user profile: "Permissions Given: 47"

**For Receiver:**
- +5 courage points per permission received
- Notification: "Sarah granted you permission! +5 courage points"
- Collection of permissions visible on victory card

### API Endpoints

**POST /api/victories/:victoryId/permission**

**Request Body:**
```json
{
  "permissionType": 4,
  "giverId": "user_456"
}
```

**Response:**
```json
{
  "success": true,
  "permissionText": "Permission granted to call yourself a traveler",
  "couragePointsAwarded": 5
}
```

**Business Logic:**
- Create PermissionSlip record
- Add +5 courage points to receiver
- Send notification to receiver
- Generate appropriate permission text based on type and dream category

**GET /api/victories/:victoryId/permissions**

**Response:**
```json
{
  "permissions": [
    {
      "id": "perm_123",
      "giverDisplayName": "Sarah",
      "permissionText": "Permission granted to call yourself a traveler",
      "createdAt": "2026-01-28T14:30:00Z"
    }
  ],
  "count": 5
}
```

---

## 2.2 Evidence Posts (Detailed Victory Stories)

### What It Is
Users can expand on their victory with more context using a structured template.

### When to Use
- Optional deeper dive after posting a victory card
- For particularly impactful milestones
- To help others on the same journey

### Data Model

```typescript
interface EvidencePost {
  id: string;
  victoryCardId: string; // Links to original victory card
  userId: string;
  
  // Structured content
  whatIDid: string; // Concrete action (max 300 chars)
  whatILearned: string; // Real insight (max 300 chars)
  whatSurprisedMe: string; // Humanizing detail (max 300 chars)
  forAnyoneHesitating: string; // Advice/permission (max 300 chars)
  
  createdAt: string;
}
```

### Evidence Post UI

**Creation Form (Shown after posting Victory Card):**
```
┌─────────────────────────────────────────────┐
│  Want to add more detail?                   │
│  (Optional - help others on your journey)   │
├─────────────────────────────────────────────┤
│                                             │
│  What I did:                                │
│  [Text area - 300 char max]                 │
│                                             │
│  What I learned:                            │
│  [Text area - 300 char max]                 │
│                                             │
│  What surprised me:                         │
│  [Text area - 300 char max]                 │
│                                             │
│  For anyone hesitating:                     │
│  [Text area - 300 char max]                 │
│                                             │
│  [Skip]                    [Add Evidence]   │
└─────────────────────────────────────────────┘
```

**Display (Attached to Victory Card):**
```
[Expand Evidence ▼]

─────────────────────────────────

📝 EVIDENCE

What I did:
Asked for $125K (currently making $95K). Used the script 
I practiced with my friend.

What I learned:
My manager didn't seem shocked. I was WAY more scared than 
I needed to be.

What surprised me:
She asked me to send her my achievements doc. She's taking 
it to HER boss. I thought this would be a "no" but it's 
actually moving forward.

For anyone hesitating:
The 3 weeks of anxiety before the meeting were worse than 
the actual 20-minute conversation. Just do it.
```

### Evidence Post Features

**Formatting:**
- 4 clear sections with headers
- Different visual treatment (indented, different bg color)
- Collapsible (click to expand/collapse)

**Benefits:**
- Adds depth without overwhelming the feed
- Structured format prevents rambling
- "What surprised me" humanizes the win
- "For anyone hesitating" provides peer permission

### API Endpoints

**POST /api/victories/:victoryId/evidence**

**Request Body:**
```json
{
  "whatIDid": "string",
  "whatILearned": "string",
  "whatSurprisedMe": "string",
  "forAnyoneHesitating": "string"
}
```

**Response:**
```json
{
  "success": true,
  "evidencePostId": "evidence_123",
  "couragePointsAwarded": 10 // Bonus for detailed sharing
}
```

---

## 2.3 Journey Recaps (Completed Dreams)

### What It Is
When someone completes an entire dream (100% milestones done), they can share their full journey as a special post type.

### Data Model

```typescript
interface JourneyRecap {
  id: string;
  userId: string;
  userDisplayName: string;
  dreamId: string;
  dreamTitle: string;
  dreamCategory: 
    | 'career_professional'      // Career & Professional Growth
    | 'personal_development'     // Personal Development & Learning
    | 'health_wellness'          // Health & Wellness
    | 'creative_expression'      // Creative Expression
    | 'relationships_community'  // Relationships & Community
    | 'travel_exploration'       // Travel & Exploration
    | 'finance_security'         // Finance & Security
    | 'lifestyle_hobbies'        // Lifestyle & Hobbies
    | 'courage_challenges'       // Courage Challenges
    | 'achievement_goals';       // Achievement Goals
  
  // Journey stats
  durationDays: number;
  milestonesCompleted: number;
  totalConfidenceGain: number;
  totalCouragePoints: number;
  
  // User reflections
  keyMilestones: string[]; // Array of 2-3 milestone IDs that were game-changers
  biggestSurprise: string; // Max 300 chars
  adviceForOthers: string; // Max 300 chars
  
  // Metadata
  completedDate: string;
  createdAt: string;
  
  // Interactions
  courageBoosts: number;
  permissionSlips: PermissionSlip[];
  meTooCount: number;
}
```

### Journey Recap UI

**Creation Flow (After completing final milestone):**

1. Journey Complete celebration screen
2. "Share Your Journey" button
3. Journey Recap form:

```
┌─────────────────────────────────────────────┐
│  🏆 Share Your Journey                      │
├─────────────────────────────────────────────┤
│                                             │
│  Your Stats:                                │
│  • 70 days from start to finish             │
│  • 8 milestones completed                   │
│  • +165% confidence gained                  │
│  • 480 courage points earned                │
│                                             │
│  ───────────────────────────────────────    │
│                                             │
│  Which 2-3 milestones changed everything?   │
│  [✓] Book refundable flight                 │
│  [✓] Join solo travelers group              │
│  [ ] Research neighborhoods                 │
│  [ ] Set budget                             │
│                                             │
│  What was your biggest surprise?            │
│  [Text area - 300 char max]                 │
│                                             │
│  What advice would you give someone         │
│  starting this dream?                       │
│  [Text area - 300 char max]                 │
│                                             │
│  [Skip]              [Share Journey]        │
└─────────────────────────────────────────────┘
```

**Display on Feed:**
```
┌─────────────────────────────────────────────┐
│ 🏆 JOURNEY COMPLETE              [TRAVEL]   │
├─────────────────────────────────────────────┤
│                                             │
│  SOLO TRIP TO BALI                          │
│                                             │
│  70 days • 8 milestones • +165% confidence  │
│                                             │
│  Game-Changing Milestones:                  │
│  • Book refundable flight                   │
│  • Join solo travelers group                │
│                                             │
│  "The biggest surprise was that other women │
│  in the FB group had the SAME fears I did.  │
│  I wasn't alone or weird—I was normal."     │
│                                             │
│  Advice: "Start with the FB group. Having   │
│  200 women say 'I did this and survived'    │
│  made booking the flight feel possible."    │
│                                             │
│  — Sarah, 32, Chicago                       │
│                                             │
├─────────────────────────────────────────────┤
│ [⚡ 47 Boosts] [💬 12 Permissions] [👥 89 Me Too]│
└─────────────────────────────────────────────┘
```

**Visual Differences from Victory Cards:**
- Trophy icon 🏆 instead of checkmark
- Special "Journey Complete" badge
- Highlighted background (gradient)
- Larger stats display
- Key milestones list (clickable to see those victories)

### Journey Recap Benefits

**For Poster:**
- +25 courage points for sharing (bonus for complete journey)
- Featured positioning in feed (higher priority)
- Badge on profile: "Completed X Dreams"

**For Community:**
- Proof that dreams DO get finished
- Roadmap for others on same journey
- Inspiration from someone who was recently in their shoes

---

## 2.4 "Me Too" Feature

### What It Is
A solidarity button that says "I'm working on this same dream" without requiring a full interaction.

### How It Works

**Visual:**
- 👥 icon with count
- Appears on all victory cards and journey recaps
- One click = "Me Too" (toggle on/off)

**What It Does:**
- Increments `meTooCount` on the victory/journey
- Adds victory to user's "Inspirations" saved list
- Shows poster: "89 women are on this journey with you"
- No notification sent (low-pressure solidarity)

### Data Model

```typescript
interface MeToo {
  id: string;
  victoryCardId?: string;
  journeyRecapId?: string;
  userId: string;
  createdAt: string;
}
```

### UI Display

**Button States:**
```
// Not clicked
👥 23 Me Too

// Clicked (user has clicked)
👥 24 Me Too ✓
```

**Tooltip on Hover:**
"Click if you're working on a similar dream"

### Benefits

**For User:**
- Low-effort way to show solidarity
- Saves victories they find relatable
- Creates personal "inspiration board"

**For Poster:**
- Feels supported without pressure to respond
- Higher count = more validation
- No notification spam

**For Community:**
- Helps identify popular dreams/milestones
- Data for "Just Like Me" algorithm (Phase 3)

### API Endpoint

**POST /api/victories/:victoryId/metoo**

**Request Body:**
```json
{
  "userId": "user_456"
}
```

**Response:**
```json
{
  "success": true,
  "newMeTooCount": 24,
  "added": true // true if added, false if removed (toggle)
}
```

---

# PHASE 3: Advanced Features

## Goal
Personalize the feed, add community stats, and improve discovery with advanced filtering.

---

## 3.1 "Just Like Me" Algorithm

### What It Is
Personalized feed that prioritizes victories from women on similar journeys.

### How It Works

**Matching Logic:**
1. **Primary Match:** Same dream category as user's active dreams
   - User has active "Solo Trip" dream → Prioritize travel victories
2. **Secondary Match:** Similar milestone stage
   - User stuck on "Book Flight" → Show others who just completed that
3. **Tertiary Match:** Similar user demographics (optional)
   - Same age range, same location type (city vs. rural)

**Feed Ordering:**
```
1. Exact milestone match (someone who just did what you're about to do)
2. Same dream category
3. Journey recaps in your categories
4. High engagement (lots of boosts/permissions)
5. Recent (chronological)
```

### Implementation

**Algorithm Pseudocode:**
```
function sortFeed(victories, user) {
  return victories.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // +100 points: Same milestone as user's next milestone
    if (a.milestoneId === user.nextMilestoneId) scoreA += 100;
    if (b.milestoneId === user.nextMilestoneId) scoreB += 100;
    
    // +50 points: Same category as user's active dreams
    if (userActiveDreamCategories.includes(a.dreamCategory)) scoreA += 50;
    if (userActiveDreamCategories.includes(b.dreamCategory)) scoreB += 50;
    
    // +25 points: Journey recap (completed dream)
    if (a.isJourneyRecap) scoreA += 25;
    if (b.isJourneyRecap) scoreB += 25;
    
    // +10 points: High engagement (>20 boosts or >10 permissions)
    if (a.courageBoosts > 20) scoreA += 10;
    if (b.courageBoosts > 20) scoreB += 10;
    
    // +5 points: Recent (within 24 hours)
    if (isWithin24Hours(a.createdAt)) scoreA += 5;
    if (isWithin24Hours(b.createdAt)) scoreB += 5;
    
    // Sort by score descending
    return scoreB - scoreA;
  });
}
```

### UI Indicator

**Feed Header:**
```
Victory Wall

Showing victories just like your journey ✨
[View All Victories]
```

**Toggle:**
- "Just Like Me" (default, personalized)
- "All Victories" (chronological, no filtering)

---

## 3.2 Weekly Community Stats

### What It Is
Aggregate stats shown at the top of Victory Wall to create momentum and normalize big actions.

### Data Displayed

**Weekly Stats Widget:**
```
┌─────────────────────────────────────────────┐
│  This Week in Our Community                 │
├─────────────────────────────────────────────┤
│  📊 1,247 milestones completed              │
│  ✈️ 23 women started their travel dreams   │
│  💼 89 women had career conversations       │
│  🔥 342 critical wins (the scary stuff)     │
└─────────────────────────────────────────────┘
```

**Visual Design:**
- Subtle gradient background
- Icons for each stat category
- Updates every Monday 12am UTC

### Data Collection

**Aggregate Queries:**
- Total victories posted this week
- Count by category
- Count by impact level (critical = "scary stuff")
- Unique milestones (group by milestone type)

### Benefits

**For Users:**
- Shows scale (you're part of something bigger)
- Normalizes big actions ("89 women did the thing I'm scared of")
- Creates healthy FOMO (action FOMO, not comparison FOMO)

**For App:**
- Social proof of active community
- Retention hook (check back weekly for new stats)

---

## 3.3 Advanced Filtering

### Category Filter (Enhanced)

**Already in Phase 1, enhanced in Phase 3:**
- Filter by single category OR multiple
- Checkbox selection instead of single dropdown
- "Apply Filters" button

**UI:**
```
Filters:

Categories:
[✓] Career & Professional Growth
[✓] Personal Development & Learning
[✓] Health & Wellness
[ ] Creative Expression
[ ] Relationships & Community
[ ] Travel & Exploration
[ ] Finance & Security
[ ] Lifestyle & Hobbies
[ ] Courage Challenges
[ ] Achievement Goals

Impact Level:
[✓] Critical Wins
[✓] High Impact
[ ] Medium Impact
[ ] Low Impact

Time:
( ) All Time
(•) This Week
( ) This Month

[Clear All]  [Apply Filters]
```

### Impact Level Filter

**Purpose:** 
Help users find inspiration appropriate to their stage.

**Options:**
- Critical Wins (the big scary stuff)
- High Impact (major progress)
- Medium Impact (foundation building)
- Low Impact (small wins)

**Use Cases:**
- Feeling stuck → Filter for "Critical Wins" to see others push through
- Just starting → Filter for "Low Impact" to see easy first steps
- Need validation → Filter for "High Impact" to see meaningful progress

### Saved Filters

**Feature:**
Users can save filter combinations as presets.

**Example Presets:**
- "My Journey" (same category as active dreams + critical wins)
- "Small Wins" (all categories + low/medium impact)
- "Inspiration" (journey recaps + critical wins)

---

## Summary: Implementation Checklist

### Phase 1 (MVP) - Core Victory Wall
- [ ] Victory Card data model and API
- [ ] Victory Card UI component
- [ ] Victory Wall feed with infinite scroll
- [ ] Category filter dropdown
- [ ] Time filter (week/month/all)
- [ ] Courage Boost interaction
- [ ] Courage points system integration
- [ ] User profile victory stats
- [ ] Boost notifications

### Phase 2 - Enhanced Interactions
- [ ] Permission Slip selector modal
- [ ] Permission Slip display on cards
- [ ] Permission Slip API endpoints
- [ ] Evidence Post creation form
- [ ] Evidence Post display (collapsible)
- [ ] Journey Recap creation flow
- [ ] Journey Recap special card design
- [ ] Me Too button and toggle
- [ ] Me Too saved inspirations list

### Phase 3 - Advanced Features
- [ ] "Just Like Me" algorithm implementation
- [ ] Personalized feed toggle
- [ ] Weekly community stats widget
- [ ] Advanced multi-select filters
- [ ] Saved filter presets

---

## Technical Considerations

### Performance

**Feed Optimization:**
- Implement virtual scrolling for long feeds (react-window or react-virtuoso)
- Lazy load images (victory card backgrounds, user avatars)
- Paginate API responses (20-50 cards per page)
- Cache victory cards in Redux/Context to avoid re-fetching

**Database Indexing:**
```sql
-- Critical indexes for Victory Wall queries
CREATE INDEX idx_victories_category ON victory_cards(dream_category);
CREATE INDEX idx_victories_completed_date ON victory_cards(completed_date);
CREATE INDEX idx_victories_created_at ON victory_cards(created_at);
CREATE INDEX idx_boosts_victory ON courage_boosts(victory_card_id);
CREATE INDEX idx_permissions_victory ON permission_slips(victory_card_id);
```

### Real-Time Updates

**When to Use Real-Time:**
- Courage boost count (increment immediately on click)
- Permission slip count (increment immediately)
- New victories appearing in feed (optional, nice-to-have)

**Implementation:**
- WebSocket connection for live boost/permission updates
- Optimistic UI updates (update UI immediately, sync with server after)
- Fallback: Poll every 30 seconds for new content

### State Management

**Redux/Context Structure:**
```typescript
interface CommunityState {
  feed: {
    victories: VictoryCard[];
    loading: boolean;
    hasMore: boolean;
    filters: {
      categories: string[];
      impactLevels: string[];
      timeframe: string;
    };
  };
  currentVictory: VictoryCard | null;
  userStats: {
    victoriesShared: number;
    boostsReceived: number;
    boostsGiven: number;
    permissionsGiven: number;
  };
}
```

### Mobile Optimization

**Responsive Design:**
- Victory cards stack vertically (full width on mobile)
- Filter panel becomes bottom sheet/modal on mobile
- Sticky header with category pills (horizontal scroll)
- Touch-optimized boost/permission buttons (larger tap targets)

**Performance:**
- Reduce image sizes for mobile (serve different resolutions)
- Infinite scroll with smaller page size (10 cards vs. 20 on desktop)
- Lazy load below-the-fold content

---

## Success Metrics

### Engagement Metrics
- Daily active users viewing Victory Wall
- Victory cards posted per day
- Courage boosts given per user per day
- Permission slips given per user per day
- Me Too clicks per victory
- Evidence posts vs. basic victories (depth of sharing)

### Retention Metrics
- Users who post victory return rate (7-day, 30-day)
- Users who receive boosts return rate
- Users who engage with "Just Like Me" feed vs. chronological

### Community Health
- Ratio of givers vs. receivers (balanced community)
- Average time from milestone completion to sharing
- Diversity of dream categories represented

### Quality Metrics
- Average evidence post length (indicator of thoughtful sharing)
- Journey recap completion rate (% who share when dream complete)
- User-reported "helpfulness" of community features

---

## Development Priority

**Start Here:**
1. Phase 1 Core Victory Wall (get basic sharing working)
2. Phase 2 Permission Slips (unique interaction model)
3. Phase 2 Journey Recaps (celebrate completions)
4. Phase 3 "Just Like Me" (personalization)
5. Phase 3 Advanced Filters (discovery)

**The community's success depends on:**
- Low barrier to sharing (auto-generated cards)
- High value interactions (courage boosts have real worth)
- Anti-comparison design (no follower counts, no popularity metrics)
- Proof over perfection (only share AFTER doing the thing)

Good luck building the Victory Wall! 🚀
