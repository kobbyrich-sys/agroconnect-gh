# AgroConnect GH

Ghana's digital agricultural and manufacturing marketplace — connecting farmers, manufacturers, and buyers directly.

Built with Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, and Flutter.

## Structure

```
agroconnect-gh/
├── apps/
│   ├── website/      # Public marketplace (Next.js)
│   ├── admin/        # Admin dashboard (Next.js)
│   └── mobile/       # Mobile app (Flutter)
├── packages/
│   ├── models/       # Shared TypeScript types
│   ├── shared/       # Shared utilities & Supabase client
│   └── ui/           # Shared UI components
├── supabase/
│   └── migrations/   # Database migrations
└── package.json      # Monorepo root
```

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Mobile:** Flutter
- **Hosting:** Vercel
