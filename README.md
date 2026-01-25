# Gestão Solo

Sales and inventory management system for micro-operations.

## Documentation

- **[SRS.md](./SRS.md)** - Software Requirements Specification (IEEE 830)
- **[SDD.md](./SDD.md)** - Software Design Document (IEEE 1016)
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines for Claude Code
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment and migration guide

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.6
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Local Development

```bash
# Install dependencies
bun install

# Start Supabase local instance
bunx supabase start

# Run migrations
bunx supabase migration up

# Start dev server
bun run dev
```

### Environment Variables

Create `.env.local` for local development:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key
```

Get the local anon key from `bunx supabase status`.

## Database

### Migrations

```bash
# Create new migration
bunx supabase migration new migration_name

# Apply migrations locally
bunx supabase migration up

# Reset database (caution: deletes data)
bunx supabase db reset

# Check migration status
bunx supabase migration list --local
```

### Current Schema

- `categories` - Product categories
- `items` - Merchandise and supplies with stock tracking
- `stock_movements` - Immutable audit trail of stock changes
- `v_low_stock_items` - View for low stock alerts

## Tech Stack

- **Frontend:** React 19, TypeScript, TanStack Router
- **UI:** shadcn/ui (Radix Nova), Tailwind CSS, Tabler Icons
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Build:** Vite
- **Package Manager:** Bun
- **i18n:** i18next (Portuguese & English)

## Project Structure

```text
src/
├── routes/           # File-based routing (TanStack Router)
│   ├── _authenticated/  # Protected routes
│   └── index.tsx
├── components/       # React components
│   └── ui/          # shadcn/ui primitives
├── lib/             # Utilities, types, queries
│   ├── types/       # TypeScript interfaces
│   ├── supabase.ts  # Supabase client
│   └── *-queries.ts # Data access layer
├── locales/         # i18n translations
│   ├── pt/          # Portuguese
│   └── en/          # English
└── hooks/           # Custom React hooks

supabase/
├── migrations/      # SQL migration files
└── config.toml      # Supabase configuration
```

## Authentication

- Email/password authentication via Supabase Auth
- Protected routes under `_authenticated/` directory
- Row Level Security (RLS) policies for multi-tenancy
- Session persistence in localStorage

## Internationalization

All user-facing text supports:

- Portuguese (default)
- English

Translation files: `src/locales/{pt,en}/*.json`

## Deployment

Automatic deployment via GitHub Actions:

1. **Migration workflow** (`.github/workflows/migrate.yml`)
   - Runs automatically when migration files change
   - Applies database schema changes
   - Manual trigger available

2. **Deploy workflow** (`.github/workflows/deploy.yml`)
   - Builds app with production environment
   - Deploys to GitHub Pages
   - Manual trigger available

**Note:** Workflows run independently. When you push migrations + code, the migration workflow runs first, then the deploy workflow runs, ensuring the database is ready for the new code.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Development Workflow

1. Check requirements in `SRS.md`
2. Design approach (follow patterns in `SDD.md`)
3. Create migration if database changes needed
4. Implement feature with TypeScript types
5. Add i18n translations (both languages)
6. Test mobile responsiveness
7. Commit with conventional commit message

## Commit Convention

```text
feat: add stock adjustment feature
fix: resolve authentication redirect issue
docs: update deployment guide
refactor: simplify item form validation
chore: update dependencies
```

## Key Features

- ✅ Stock management (merchandise & supplies)
- ✅ Category organization
- ✅ Manual stock adjustments
- ✅ Low stock alerts with configurable thresholds
- ✅ Stock movement history (audit trail)
- ✅ Mobile-first responsive design
- ✅ Bilingual interface
- ✅ Multi-tenancy with RLS

## Planned Features

- Order management
- Sales tracking
- Payment recording
- Financial reports
- Data export (CSV/PDF)

## License

Private project - All rights reserved

## Development

Built with assistance from [Claude Code](https://claude.com/claude-code).

For development guidelines, see [CLAUDE.md](./CLAUDE.md).
