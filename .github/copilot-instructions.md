# Copilot Instructions - Table Tennis Ranker

## Project Overview

This is a **validation landing page** for a table tennis ranking application for Strativ employees. The goal is to collect interest from @strativ.se email addresses to validate the idea before building the full application. We'll build the full app if we get 10 interested people.

## The Idea - Table Tennis Ranking System

### Problem Statement
Strativ has an office table tennis culture, but there's no organized way to:
- Track who's winning and losing
- See who the best players are
- Challenge colleagues to matches
- Build friendly competition
- Settle debates about who's actually the best

### Solution
A simple, transparent ranking system that:
- **Tracks all matches** between employees
- **Calculates rankings** based on match results
- **Shows leaderboards** (monthly, all-time)
- **Validates results** via opponent confirmation
- **Maintains fairness** with auto-confirmation system

### How It Will Work (Future Full App)

#### 1. Match Logging
- Player logs a match: "I played against John, won 11-9, 11-7"
- John receives a notification to confirm
- If confirmed within 24-48 hours → match is recorded
- If not confirmed → auto-confirmed (prevents bottlenecks)
- If disputed → marked for admin review

#### 2. Ranking Algorithm
- Use ELO-style rating system (like chess)
- Initial rating: 1500 for all players
- Beating higher-ranked players = more points
- Losing to lower-ranked players = lose more points
- Ratings accumulate over time (no resets)
- Last 30 days view shows recent performance rankings

#### 3. Leaderboards
- **All-Time Leaders**: Career stats and rankings
- **Last 30 Days**: Rankings based on recent performance
- **Win Streaks**: Current and longest streaks
- **Head-to-Head**: Personal rivalry stats

#### 4. User Experience
- **Sign In**: Use Strativ email (@strativ.se)
- **Dashboard**: See your rank, recent matches, stats
- **Log Match**: Quick form (opponent, score, winner)
- **Pending Matches**: List of matches awaiting confirmation
- **Leaderboard**: See where you stand
- **Profile**: Your stats, win rate, favorite opponents

### Key Features (Planned)

1. **Easy Match Logging**
   - Simple form: opponent, score, winner
   - Mobile-friendly for quick logging
   - Support for both singles matches

2. **Live Rankings**
   - Real-time updates after each confirmed match
   - Last 30 days leaderboard
   - All-time career leaderboard
   - Department/team rankings

3. **Win Streaks**
   - Track current winning streaks
   - Display longest streaks
   - Head-to-head records

4. **Auto-Confirmation**
   - 24-48 hour confirmation window
   - Auto-confirm if no response (prevents delays)
   - Dispute mechanism for incorrect entries

5. **Notifications**
   - Email when challenged
   - Reminders to confirm matches
   - Weekly rank updates

6. **Statistics Dashboard**
   - Win/loss ratio
   - Average score differentials
   - Best opponents
   - Improvement over time

### Target Audience
- Strativ employees who play table tennis
- Competitive players who want rankings
- Casual players who want to track progress
- Anyone interested in friendly office competition

### Success Metrics
- **Validation Phase**: 10+ interested employees
- **Launch Phase**: 30+ active users
- **Growth Phase**: 80% of regular players using the app
- **Engagement**: Average 2+ matches logged per week

### Why This Matters
1. **Builds Community**: Brings employees together
2. **Encourages Activity**: More people playing table tennis
3. **Fair Competition**: Transparent ranking system
4. **Fun Factor**: Gamifies the office table tennis experience
5. **Settles Debates**: Data-driven rankings, not just opinions

### Current Phase: Validation
Right now, we're just collecting emails to see if there's enough interest. If we get 10 people interested, we'll build the full application with all the features described above.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM v7
- **Styling**: Tailwind CSS v4 (using new `@theme` syntax)
- **UI Components**: shadcn/ui
- **Fonts**: DM Serif Display (headings), Geist Sans (body)
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Code Style & Conventions

### TypeScript
- Always use TypeScript, never JavaScript
- Use strict type checking
- Prefer interfaces for props, types for unions
- Use proper typing for API responses and database models

### React & Next.js
- Use "use client" directive for client components
- Use Server Components by default
- Prefer async/await for server components
- Use Next.js 15 App Router conventions

### Styling
- Use Tailwind CSS v4 syntax exclusively
- No inline styles
- Use design system variables: `primary`, `primary-foreground`, `zinc-*` colors
- Dark theme by default (bg-zinc-950, text-white)
- Classic design: serif fonts for headings, circular elements

### Component Structure
- Keep components focused and single-purpose
- Extract reusable UI into `/components/ui/`
- Use shadcn/ui components when available
- Follow shadcn/ui patterns for new components

## Design System

### Colors
- **Primary**: `#00ffa5` (bright cyan-green) - use `bg-primary`, `text-primary`, `border-primary`
- **Background**: `bg-zinc-950` (dark)
- **Text**: `text-white`, `text-zinc-400` (muted)
- **Borders**: `border-zinc-800`, `border-zinc-700`
- **Cards**: `bg-zinc-900`, `border-zinc-800`

### Typography
- **Headings**: Use `font-serif` (DM Serif Display)
- **Body**: Default sans-serif (Geist Sans)
- **Sizes**: Use Tailwind size utilities (`text-xl`, `text-2xl`, etc.)

### Spacing & Layout
- Container: `container mx-auto px-4`
- Consistent spacing: `space-y-*`, `gap-*`
- Use rounded-full for circular elements (icons, badges)

## Project Structure

```
app/
├── api/interest/route.ts    # Email submission API
├── globals.css              # Tailwind config + theme
├── layout.tsx               # Root layout with fonts
└── page.tsx                 # Main entry (shows LandingPage)

components/
├── ui/                      # shadcn/ui components (button, card, dialog)
├── interest-modal.tsx       # Email capture modal
└── landing-page.tsx         # Main landing page with success state

lib/
└── prisma.ts               # Prisma singleton instance

prisma/
├── schema.prisma           # Database schema (InterestedUser model)
└── prisma.config.ts        # Prisma v7 config
```

## Key Features & Implementation

### Email Collection Flow
1. User clicks "I'm Interested" button
2. Modal opens (shadcn Dialog component)
3. User enters email (validated for @strativ.se domain)
4. POST to `/api/interest` endpoint
5. Success: Show thank you page, Close modal
6. Error: Display error message in modal

### Email Validation Rules
- **Required domain**: Must end with `@strativ.se`
- **Validation locations**: Client-side (modal) AND server-side (API route)
- **Error handling**: User-friendly messages for all error cases

### Database Model
```prisma
model InterestedUser {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Important Patterns

### Prisma v7 Client Instantiation
Always use `datasourceUrl` in Prisma Client constructor:
```typescript
export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})
```

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    // Validation
    // Database operation
    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ error: "message" }, { status: 400 })
  }
}
```

### Modal State Management
```typescript
const [isModalOpen, setIsModalOpen] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)

const handleSuccess = () => {
  setShowSuccess(true)
}
```

## Common Tasks & How to Approach Them

### Adding a New Feature
1. Create component in `/components/`
2. Add types/interfaces
3. Implement with Tailwind styling
4. Use existing design system colors
5. Test with @strativ.se emails

### Modifying Styles
- Always use Tailwind utilities
- Maintain dark theme consistency
- Use `primary` color for accents
- Keep classic serif fonts for headings

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Update TypeScript types
4. Update API routes

### Adding shadcn/ui Components
```bash
pnpm dlx shadcn@latest add [component-name]
```
Then import and use in your components.

## What NOT to Do

❌ Don't use inline styles - use Tailwind classes  
❌ Don't use Google OAuth - we switched to email collection  
❌ Don't accept emails from other domains - only @strativ.se  
❌ Don't use light theme - dark theme only  
❌ Don't use NextAuth.js - removed, not needed  
❌ Don't use old Prisma patterns - use v7 with datasourceUrl  
❌ Don't use gradient backgrounds - we moved to solid dark colors  

## ELO Rating System

### Overview
This application uses the **ELO rating system** (similar to chess) to calculate player rankings. ELO provides a fair, dynamic rating that adjusts based on match outcomes and opponent strength.

### Core Formula
```
New Rating = Old Rating + K × (Actual Score - Expected Win Probability)
```

**Expected Win Probability:**
```
P = 1 / (1 + 10^((Opponent Rating - Your Rating) / 400))
```

### Key Parameters
- **Initial Rating**: 1500 for all new players
- **K-Factor**: 32 (how much ratings change per match)
- **Actual Score**: 1 for win, 0 for loss
- **Expected Win Probability**: 0.0 to 1.0 (probability based on rating difference)

### Rating Difference Examples
Understanding how rating differences translate to win probabilities:

| Rating Diff | Win Probability |
|-------------|-----------------|
| 0 points    | 50%            |
| 19 points   | 53%            |
| 50 points   | 57%            |
| 100 points  | 64%            |
| 200 points  | 76%            |
| 400 points  | 91%            |

### Singles (1v1) Calculation
- Direct comparison of two player ratings
- Winner gains points, loser loses points
- Amount depends on rating difference
- Upsets (lower-rated player wins) result in larger rating changes

**Example:**
- Player A (1600) beats Player B (1500)
- Expected win probability: 64%
- Player A gains ~12 points (1612)
- Player B loses ~12 points (1488)

### Doubles (2v2) Calculation
- Uses **team average rating** for calculation
- Rating change distributed equally to both team members
- Encourages balanced team formation

**Example:**
- Team 1: Player A (1600) + Player B (1400) = Avg 1500
- Team 2: Player C (1550) + Player D (1450) = Avg 1500
- Even match (50% win probability)
- Winners each gain ~16 points
- Losers each lose ~16 points

### Implementation Details

**Location**: `lib/elo.ts`

**Functions:**
- `calculateELOSingles()`: Calculate rating changes for 1v1 matches
- `calculateELODoubles()`: Calculate rating changes for 2v2 matches
- `calculateELO()`: Unified function that handles both match types

**Win Probability Display:**
- Shown in challenge modal before sending challenge
- Green (primary color) if ≥50% chance
- Red if <50% chance
- Updates in real-time as players are selected

### Important Consistency
**The same ELO formula is used in three places:**
1. `lib/elo.ts` - Server-side match result calculations
2. `components/challenge-modal.tsx` - Client-side preview before sending challenge
3. `components/submit-result-modal.tsx` - Client-side preview when submitting results

All use: `1 / (1 + Math.pow(10, (opponentRating - yourRating) / 400))`

This ensures the win probability shown to users matches exactly what will be used for rating calculations after the match.

**Critical: When calling `calculateELO()`:**
- Always determine the **overall winner** first (who won more matches)
- Pass the overall winner's ratings as `winner1/winner2` parameters
- Pass the overall loser's ratings as `loser1/loser2` parameters
- Pass `matchesWon` as the number won by the winner, `matchesLost` as the number won by the loser
- Example: If you won 5 and lost 2 overall, YOU are the winner - your ratings go in winner slots

### Design Decisions
1. **No rating decay**: Ratings persist indefinitely (career stats)
2. **Equal distribution in doubles**: Both team members get same rating change
3. **K-factor of 32**: Standard for active players (not too volatile, not too stable)
4. **1500 starting point**: Industry standard, allows room to grow and fall
5. **Team average for doubles**: Simplest fair method for team calculations

### When Working with ELO Code
- Always use the formulas from `lib/elo.ts`
- Don't modify K-factor without careful consideration
- Maintain consistency between preview and actual calculations
- Round ratings to whole numbers for display
- Show win probability as percentage (0-100%)

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string

## Testing Approach

### Manual Testing
1. Start dev server: `pnpm dev`
2. Click interest button
3. Enter test@strativ.se
4. Verify success page
5. Check Prisma Studio: `npx prisma studio`

### Email Validation Testing
- ✅ Valid: `test@strativ.se`
- ❌ Invalid: `test@gmail.com`
- ❌ Invalid: `test@strativ.com`
- ❌ Invalid: `test@other.se`

## Key Files to Reference

- **Design System**: `app/globals.css` - all color and theme variables
- **Main Entry**: `app/page.tsx` - simplified to just show LandingPage
- **API Logic**: `app/api/interest/route.ts` - email validation and DB ops
- **UI Modal**: `components/interest-modal.tsx` - shadcn Dialog implementation
- **Landing Page**: `components/landing-page.tsx` - main UI with success state
- **Database**: `prisma/schema.prisma` - single InterestedUser model

## Future Considerations

If the validation succeeds (10+ interested users), the full app will need:
- User authentication system
- Match logging functionality
- Ranking algorithms (ELO)
- Real-time leaderboards
- Notification system
- Admin dashboard

For now, focus on:
- Clean, simple email collection
- Beautiful, classic dark UI
- Solid validation and error handling
- Database integrity

## Helpful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build production
pnpm lint                   # Lint code

# Database
npx prisma studio           # View database
npx prisma generate         # Generate client
npx prisma db push          # Push schema

# Add UI Components
pnpm dlx shadcn@latest add [component]
```

## Current State

- ✅ Landing page with dark theme
- ✅ Email collection modal (shadcn Dialog)
- ✅ @strativ.se domain validation
- ✅ Success page after submission
- ✅ PostgreSQL + Prisma setup
- ✅ API endpoint for email submission
- ✅ Tailwind CSS v4 with custom theme
- ✅ DM Serif Display for headings
- ❌ No authentication (by design)
- ❌ No Google OAuth (removed)
- ❌ No user dashboard (validation phase only)

## When Helping with Code

1. **Maintain dark theme**: Always use zinc-950, zinc-900, zinc-800 backgrounds
2. **Use primary color**: #00ffa5 for all accent colors
3. **Validate emails**: Always enforce @strativ.se domain
4. **Keep it simple**: This is a validation page, not the full app
5. **Follow patterns**: Reference existing components for consistency
6. **TypeScript**: Always type everything properly
7. **Accessibility**: Use semantic HTML and ARIA when needed
8. **Error handling**: Always handle errors gracefully with user-friendly messages

---

This is a **focused validation project**. Keep code clean, simple, and maintainable. The goal is to quickly validate interest, not build the full application yet.
