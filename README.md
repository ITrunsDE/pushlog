# ShipLog

A changelog tool for indie hackers and solo developers.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + TailwindUI
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Better Auth
- **Email**: Resend
- **AI**: OpenAI (gpt-4o-mini)
- **Payments**: Stripe

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── changelog/         # Public changelog pages
│   ├── dashboard/         # Protected admin area
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── auth/             # Authentication logic
│   └── db.ts             # Prisma client
├── prisma/               # Database schema
├── types/                # TypeScript types
└── public/               # Static assets
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Update the `.env.local` file with your configuration:
- Database URL
- Better Auth secret
- OpenAI API key
- Resend API key
- Stripe keys

### 3. Database Setup

```bash
# Create database tables
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

- **Public Changelog Widget** - Embed a changelog on your product website
- **Multi-product Support** - Manage changelogs for multiple products
- **AI-Assisted Generation** - Generate changelog entries with OpenAI
- **Email Subscriptions** - Notify subscribers of updates via Resend
- **Stripe Integration** - Flexible subscription plans
- **Beautiful UI** - TailwindUI component patterns

## Database Schema

### User
- `id`: Unique identifier
- `email`: User email
- `name`: Display name
- `plan`: Subscription plan (free/pro/enterprise)
- `stripeCustomerId`: Stripe customer ID
- `createdAt`: Account creation date

### Product
- `id`: Unique identifier
- `userId`: Owner user ID
- `name`: Product name
- `slug`: URL-friendly slug
- `domain`: Optional product domain
- `widgetColor`: Changelog widget color
- `createdAt`: Creation date

### ChangelogEntry
- `id`: Unique identifier
- `productId`: Associated product
- `title`: Entry title
- `body`: Markdown content
- `category`: Type (feature/improvement/bugfix/breaking)
- `isPublished`: Published status
- `publishedAt`: Publication timestamp

### Subscriber
- `id`: Unique identifier
- `productId`: Associated product
- `email`: Subscriber email
- `confirmedAt`: Email confirmation date

## Planned Pages

1. `/` - Landing page
2. `/changelog/[slug]` - Public changelog page per product
3. `/dashboard` - Admin overview (protected)
4. `/dashboard/entries/new` - New entry with AI generation
5. `/dashboard/entries` - Entry list
6. `/dashboard/settings` - Widget code + product settings

## Development

### Code Generation

```bash
npm run db:generate
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Deployment

- Deploy to Vercel, Netlify, or any Node.js-compatible host
- Ensure `DATABASE_URL` and other environment variables are configured
- Run `npm run build` before deploying

## License

MIT
