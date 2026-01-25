# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Always read `SRS.md` before implementing features.** This document defines the system requirements, scope, and functional specifications for Gestão Solo - a sales and inventory management system for micro-operations.

## Development Principles

### Feature Implementation

1. **Requirements First**: Check `SRS.md` for functional (RF) and non-functional (RNF) requirements before coding
2. **Mobile-First**: Interface must be optimized for mobile devices per RNF01
3. **Scope Discipline**: The system explicitly does NOT handle payment processing, fiscal documents, or CRM - don't add these features

### Code Standards

**English-Only Code**:

All code elements MUST be written in English:

- **Variables, functions, types**: Use English names (e.g., `order`, `customer`, `payment`)
- **Database objects**: Tables, columns, enums, views, functions in English (e.g., `orders`, `order_items`, `order_status`)
- **File names**: Components, utilities, routes in English (e.g., `order-form.tsx`, `order-queries.ts`)
- **Comments**: Write code comments in English
- **Git commits**: Use English for commit messages

**Portuguese Usage**:

Portuguese is ONLY allowed in:
- User-facing text via i18n translation files (`src/locales/pt/`)
- Documentation for end users
- Requirements documents (SRS.md can use Portuguese terms when explaining business concepts)

**Common Translations**:

| Portuguese (❌ Don't Use in Code) | English (✅ Use in Code) |
|-----------------------------------|--------------------------|
| comanda | order |
| mercadoria | merchandise |
| insumo | supply |
| estoque | stock/inventory |
| entrada | entry |
| saída | exit |
| venda | sale |
| estorno | reversal |
| fechamento | closure |
| pagamento | payment |

**No Emojis in Code**:

- NEVER use emojis in code, comments, function names, or variable names
- NEVER use emojis in commit messages
- NEVER use emojis in documentation files (README.md, CLAUDE.md, SDD.md, etc.)
- Emojis are ONLY acceptable in user-facing i18n translation strings when explicitly requested

**Examples**:

✅ **Good:**
```typescript
// orders table
export interface Order {
  id: string;
  customer_name: string;
  status: OrderStatus;
  total_amount: number;
}

// order-form.tsx
function OrderForm() {
  const [orderData, setOrderData] = useState<Order>();
}
```

❌ **Bad:**
```typescript
// comandas table ❌ Portuguese
export interface Comanda { // ❌ Portuguese
  id: string;
  nome_cliente: string; // ❌ Portuguese
  status: StatusComanda; // ❌ Portuguese
  valor_total: number; // ❌ Portuguese
}

// 🍔 comanda-form.tsx ❌ Emoji in comment
function ComandaForm() { // ❌ Portuguese
  const [dadosComanda, setDadosComanda] = useState<Comanda>(); // ❌ Portuguese
}
```

### Authentication & Authorization

All protected routes live under `_authenticated/` directory. The authentication guard pattern is implemented in `_authenticated.tsx` using TanStack Router's `beforeLoad` hook:

- Check Supabase session before rendering
- Redirect to signin with return URL if unauthenticated
- Supabase client in `src/lib/supabase.ts` is the single source of truth for auth state

### Internationalization

**Bilingual by Design**: All user-facing text must support Portuguese (default) and English:

- Add new translations to BOTH `src/locales/pt/` and `src/locales/en/`
- Register new namespaces in `src/@types/resources.ts`
- Use appropriate namespace (auth, dashboard, errors, etc.) for organizational clarity
- Never hardcode strings in components - always use `t()` function

### Routing Architecture

**File-Based, Auto-Generated**:

- Routes are defined in `src/routes/` with TanStack Router conventions
- `src/routeTree.gen.ts` is auto-generated - NEVER edit manually
- Protected routes use `_authenticated/` layout.
- Use `beforeLoad` for data requirements and authorization checks

### Component Development

**shadcn/ui Pattern**:

- UI primitives come from `src/components/ui/` - managed by shadcn CLI
- Custom business components go in `src/components/`
- Use Tabler Icons consistently (`@tabler/icons-react`)
- Follow the established pattern: import from shadcn, compose custom logic on top

**Component Composition**:

- Build complex forms by composing shadcn primitives
- Keep validation logic in `src/lib/auth-utils.ts` or similar utility files
- Return internationalized error messages from validators

### State Management

**Supabase as State Source**:

- Supabase handles auth state, session persistence, and database state
- Use Supabase client hooks for reactive data
- Session persists in localStorage automatically

### Validation Patterns

Form validation utilities follow a consistent pattern:

- Validators in `src/lib/` return `string | null` (error message or null)
- Error messages use i18n for bilingual support
- Validation happens client-side before Supabase calls

### Type Safety

**TypeScript Throughout**:

- Path alias `@/*` maps to `src/*` - use it consistently
- i18n provides type-safe translation keys via namespace system
- Never use `any` - prefer `unknown` for truly unknown types

## Development Workflow

### Adding Features

1. Read the relevant requirement in `SRS.md`
2. Identify which components/routes need changes
3. Check existing i18n namespaces for appropriate text placement
4. Add translations to both language files
5. Implement with TypeScript types
6. Test mobile responsiveness (RNF01 requirement)

### Working with Supabase

**Local-First Development**:

- Run Supabase locally via CLI for development
- Environment switches between local (.env.local) and production (.env.production)
- Database schema managed in `supabase/` directory

**Schema Configuration**:

- All tables are created in the `api` schema (not `public`)
- Supabase client configured to use `api` schema via `db.schema` option
- `supabase/config.toml` exposes `api` schema via PostgREST
- Always use `api.table_name` in SQL migrations

### Adding UI Components

Use shadcn CLI to add new components - they'll be configured correctly for this project's setup (Radix Nova style, Tabler icons, zinc theme).

## Key Architectural Decisions

### Why File-Based Routing

TanStack Router provides type-safe routing with automatic code splitting. Routes are files, which makes the structure explicit and discoverable.

### Why Supabase

Handles auth, database, and real-time subscriptions in one service. Local development via CLI mirrors production environment.

### Why i18n Structure

Namespace organization (`auth`, `dashboard`, `errors`) prevents translation file bloat and makes it clear where to add new strings.

### Why shadcn/ui

Component library that you own (code lives in repo) rather than npm dependency. Tailwind-native, highly customizable, accessible by default.

## Important Constraints

From `SRS.md` section 2.2:

- **No payment processing** - only informational recording
- **No fiscal integration** - no invoice generation
- **No CRM** - no permanent customer records
- **No automatic error correction** - user input errors must be manually fixed

## Common Patterns

**Phone Number Handling**: E.164 format (international standard with country code).

**Route Protection**: Wrap route groups in `_authenticated` layout to require login. Use `beforeLoad` for authorization.

**Error Handling**: Map Supabase errors to user-friendly i18n messages in auth utilities.

**Language Switching**: Language toggle component updates i18n and persists choice to localStorage.

**Build for SPA**: Build process copies index.html to 404.html to handle direct URL access in single-page app mode.
