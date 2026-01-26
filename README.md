# TopSpin

A landing page to validate interest in a table tennis ranking application for Strativ employees. Collect emails from interested users to gauge demand before building the full application.

## 🎯 Project Goal

Validate the idea by collecting interest from Strativ employees. We'll build the full app if we get **10 interested people**.

## ✨ Features

- **Dark Theme**: Modern dark UI with classic design elements
- **Email Collection**: Modal-based email capture restricted to @strativ.se domain
- **Interest Validation**: Simple waitlist system to gauge demand
- **Success Confirmation**: Thank you page after successful submission
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM v7
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Fonts**: DM Serif Display (headings), Geist Sans (body)
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd strativ-tt-ranker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update `.env` with your database URL and other required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tt_ranker"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl"

# Cron Job Security (required for production)
CRON_SECRET="your-cron-secret-key"

# Email Service (Gmail SMTP)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Push the schema to your database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Design System

- **Primary Color**: `#00ffa5` (bright cyan-green)
- **Background**: Dark theme with zinc-950
- **Typography**: 
  - Headings: DM Serif Display (classic serif)

## 📊 Features Showcase

The landing page highlights four main features:

1. **Easy Match Logging**: Quick win/loss logging with opponent confirmation
2. **Live Rankings**: Real-time rankings and monthly leaderboards  
3. **Win Streaks**: Track winning streaks and head-to-head stats
4. **Auto-Confirm**: Matches auto-confirm after 24-48 hours

## 📧 Email Notifications

When a match result is submitted, all participants (except the submitter) receive an email notification:

- **Match Details**: Shows match type, players, and score
- **Action Required**: Reminds users to confirm or dispute within 48 hours
- **Direct Link**: Includes a link to the dashboard to review the match
- **Automatic Confirmation**: Explains the auto-confirm behavior

### Email Configuration (Gmail SMTP)

The application uses Gmail SMTP with Nodemailer for sending emails:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character password
3. **Add to your `.env` file**:
   ```env
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
   ```

**Note:** Emails will be sent from your Gmail address. Gmail has a daily sending limit of 500 emails for free accounts.

## 🔒 Email Validation

Only emails ending with `@strativ.se` are accepted. The validation happens both:
- Client-side in the modal component
- Server-side in the API route

## 📡 API Endpoints

### POST `/api/interest`

Submit interest with email address.

**Request Body:**
```json
{
  "email": "user@strativ.se"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@strativ.se",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**
- `400`: Invalid email or wrong domain
- `500`: Server error

### GET `/api/interest`

Get count of interested users.

**Response:**
```json
{
  "count": 5
}
```

## 🛠️ Development

### View Database with Prisma Studio

```bash
npx prisma studio
```

### Reset Database

```bash
npx prisma db push --force-reset
```

### Type Checking

```bash
pnpm tsc --noEmit
```

### Build for Production

```bash
pnpm build
```

### Run Production Build

```bash
pnpm start
```

## 📦 Deployment

The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any Node.js hosting platform

### Deployment Checklist

1. Set up environment variables in your hosting platform:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `CRON_SECRET`: Generate with `openssl rand -base64 32`
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_APP_PASSWORD`: Your Gmail app password
   - `NEXT_PUBLIC_APP_URL`: Your production URL (for email links)
2. Connect to a production PostgreSQL database
3. Run `npx prisma db push` or migrations
4. The cron job in `vercel.json` will automatically run daily

### Vercel Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `CRON_SECRET`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

**Note:** The cron job is configured in `vercel.json` to run every hour and automatically confirm matches after 48 hours.

## ⏰ Auto-Confirmation System

Matches are automatically confirmed after 48 hours if opponents don't respond. We use a **hybrid approach** for maximum reliability and speed:

### Two-Tier Auto-Confirmation

1. **Instant Check (On Page Load)**
   - When users visit the dashboard, expired matches are checked and confirmed immediately
   - Provides instant feedback without waiting for cron
   - Uses the shared `autoConfirmExpiredMatches()` function

2. **Background Cron Job (Every Hour)**
   - Vercel Cron Job runs hourly at `:00` (configured in `vercel.json`)
   - Catches matches even when no one visits the dashboard
   - Ensures all matches are eventually confirmed

### How It Works

- When a match is submitted → `autoConfirmAt` timestamp set to 48 hours later
- **First trigger**: User visits dashboard → checks and confirms expired matches
- **Backup trigger**: Cron job runs hourly → catches any missed matches
- Auto-confirmed matches update ratings just like manual confirmations

### Security

The cron endpoint requires `CRON_SECRET` authorization to prevent unauthorized access.

### Testing Locally

```bash
# Test the cron endpoint
curl http://localhost:3000/api/cron/auto-confirm

# Or just visit the dashboard - it will auto-confirm expired matches
```

## 🎯 Next Steps (If Validated)

Once we reach 10 interested users, the full application will include:

- User authentication and profiles
- Match logging and validation system
- Real-time ranking algorithms (ELO or similar)
- Leaderboards (monthly, all-time)
- Win streak tracking
- Head-to-head statistics
- Match history and timeline
- Email notifications system
- Admin dashboard for management
- Mobile-responsive design

## 🧪 Testing

Currently, to test the application:

1. Start the dev server
2. Click "I'm Interested" button
3. Enter an email ending with `@strativ.se`
4. Submit and see the success page

You can also check the database:
```bash
npx prisma studio
```

## 🤝 Contributing

This is an internal Strativ project. If you're a Strativ employee and want to contribute ideas, reach out to the project team.

## 📝 Notes

- This is a validation landing page, not the full application
- Authentication will be added in the full version
- The current focus is on collecting interest from potential users
- The design uses a classic dark theme with green accents

## 📄 License

Internal Strativ project - All rights reserved

---

**Built with ❤️ for the Strativ ping pong community** 🏓
