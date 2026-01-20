# Table Tennis Ranker

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

Update `.env` with your database URL:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tt_ranker"
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

1. Set up environment variables in your hosting platform
2. Connect to a production PostgreSQL database
3. Run `npx prisma db push` or migrations
4. Ensure `DATABASE_URL` is set correctly

### Vercel Deployment

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable: `DATABASE_URL`
4. Deploy

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
