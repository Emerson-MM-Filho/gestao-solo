# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Always read `SRS.md` before implementing features.** This document defines the system requirements, scope, and functional specifications for Gestão Solo - a sales and inventory management system for micro-operations.

## Development Principles

### Package Manager

**Use Bun Only**: This project uses Bun as its package manager and runtime.

- ALWAYS use `bun` instead of `npm` (e.g., `bun install`, `bun run dev`)
- ALWAYS use `bunx` instead of `npx` (e.g., `bunx shadcn@latest add button`)
- Never use npm or npx commands - they may cause dependency conflicts

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

| Portuguese (Don't Use in Code) | English (Use in Code) |
| ------------------------------- | --------------------- |
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

**Absolutely No Emojis**:

- NEVER use emojis anywhere in the codebase
- NEVER use emojis in code, comments, function names, or variable names
- NEVER use emojis in commit messages
- NEVER use emojis in documentation files (README.md, CLAUDE.md, SDD.md, SRS.md, etc.)
- NEVER use emojis in code examples or inline documentation
- NEVER use emojis as visual markers (use text like [GOOD], [BAD], [NOTE] instead)
- The ONLY exception: user-facing i18n translation strings (`src/locales/`) when explicitly requested by the user

**Examples**:

**GOOD:**

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

**BAD:**

```typescript
// comandas table [WRONG: Portuguese]
export interface Comanda { // [WRONG: Portuguese]
  id: string;
  nome_cliente: string; // [WRONG: Portuguese]
  status: StatusComanda; // [WRONG: Portuguese]
  valor_total: number; // [WRONG: Portuguese]
}

// comanda-form.tsx [WRONG: Portuguese + emoji in original]
function ComandaForm() { // [WRONG: Portuguese]
  const [dadosComanda, setDadosComanda] = useState<Comanda>(); // [WRONG: Portuguese]
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
- TooltipProvider must be placed at layout level (`src/routes/_authenticated.tsx`), not in individual routes

**Component Composition**:

- Build complex forms by composing shadcn primitives
- Keep validation logic in `src/lib/auth-utils.ts` or similar utility files
- Return internationalized error messages from validators
- Memoize event handlers with `useCallback` in components that render lists to prevent unnecessary re-renders

### State Management

**Supabase as State Source**:

- Supabase handles auth state, session persistence, and database state
- Use Supabase client hooks for reactive data
- Session persists in localStorage automatically
- Use functional state updates (`setState(prev => ...)`) for async operations to prevent race conditions
- Implement loading state tracking (`Set<string>`) to prevent duplicate async calls

### Validation Patterns

Form validation utilities follow a consistent pattern:

- Validators in `src/lib/` return `string | null` (error message or null)
- Error messages use i18n for bilingual support
- Validation happens client-side before Supabase calls
- Use proactive validation: fetch current state before mutations (e.g., check stock before adjustment)
- Set reasonable bounds on numeric inputs to prevent accidents (e.g., max adjustment ±1000)

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
7. Test with Playwright to catch runtime issues TypeScript misses (e.g., context providers)

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

## Available Tools & Integrations

### Plugins (Skills)

Invoke via Skill tool. Use automatically when task matches the skill's purpose:

**Development Workflow:**

- `superpowers:brainstorming` - REQUIRED before creating features or modifying behavior - explores requirements and design
- `superpowers:writing-plans` - Create implementation plans for multi-step tasks before coding
- `superpowers:executing-plans` - Execute written implementation plans in separate session with checkpoints
- `superpowers:test-driven-development` - Use before writing implementation code for features/bugfixes
- `superpowers:systematic-debugging` - Use when encountering bugs, test failures, or unexpected behavior
- `superpowers:verification-before-completion` - REQUIRED before claiming work complete - runs verification commands
- `superpowers:using-git-worktrees` - Create isolated git worktrees before starting feature work
- `superpowers:finishing-a-development-branch` - Present merge/PR/cleanup options when implementation complete
- `superpowers:dispatching-parallel-agents` - Execute 2+ independent tasks in parallel
- `superpowers:subagent-driven-development` - Execute plans with independent tasks in current session

**Code Quality:**

- `feature-dev:feature-dev` - Guided feature development with codebase understanding and architecture focus
- `code-review:code-review` - Code review for pull requests
- `pr-review-toolkit:review-pr` - Comprehensive PR review using specialized agents
- `superpowers:requesting-code-review` - Request code review before merging major features
- `superpowers:receiving-code-review` - Handle code review feedback with technical rigor
- `code-simplifier` - Simplify and refactor complex code
- `security-guidance` - Security best practices and vulnerability detection

**Git Operations:**

- `commit-commands:commit` - Create git commits following project conventions
- `commit-commands:commit-push-pr` - Commit, push, and open PR in one operation
- `commit-commands:clean_gone` - Clean up branches marked as [gone]
- `github` - GitHub integration for issues, PRs, and repository operations

**Commit Message Style:**

- Do NOT include "Co-Authored-By: Claude" lines in commit messages
- Keep commit messages clean and professional without AI attribution

**Frontend Design:**

- `frontend-design:frontend-design` - Create distinctive, production-grade UI components and pages

**Testing:**

- `playwright` - End-to-end testing with Playwright

**Project Documentation:**

- `claude-md-management:revise-claude-md` - Update CLAUDE.md with session learnings

**Workflow Automation:**

- `ralph-loop:ralph-loop` - Start Ralph Loop for iterative development
- `ralph-loop:cancel-ralph` - Cancel active Ralph Loop
- `ralph-loop:help` - Get help with Ralph Loop

**Utilities:**

- `keybindings-help` - Customize keyboard shortcuts in ~/.claude/keybindings.json
- `superpowers:using-superpowers` - Establish how to find and use skills
- `superpowers:writing-skills` - Create or edit custom skills

### Plugin Details

Comprehensive descriptions to help understand when to invoke each plugin:

**claude-md-management**: Tools to maintain and improve CLAUDE.md files - audit quality, capture session learnings, and keep project memory current. Use when updating project documentation or reviewing CLAUDE.md effectiveness.

**code-review**: Automated code review for pull requests using multiple specialized agents with confidence-based scoring. Use when reviewing PRs or requesting comprehensive code analysis.

**code-simplifier**: Agent that simplifies and refines code for clarity, consistency, and maintainability while preserving functionality. Use when code becomes complex or needs refactoring for readability.

**commit-commands**: Streamline your git workflow with simple commands for committing, pushing, and creating pull requests. Use for all git operations following project conventions.

**context7**: Upstash Context7 MCP server for up-to-date documentation lookup. Pull version-specific documentation and code examples directly from source repositories into your LLM context. Use when needing current library documentation.

**feature-dev**: Comprehensive feature development workflow with specialized agents for codebase exploration, architecture design, and quality review. Use for guided feature implementation with architectural focus.

**frontend-design**: Frontend design skill for UI/UX implementation. Use when building web components, pages, or applications requiring distinctive, production-grade interfaces.

**github**: Official GitHub MCP server for repository management. Create issues, manage pull requests, review code, search repositories, and interact with GitHub's full API directly from Claude Code. Use for all GitHub operations.

**playwright**: Browser automation and end-to-end testing MCP server by Microsoft. Enables Claude to interact with web pages, take screenshots, fill forms, click elements, and perform automated browser testing workflows. Use for E2E testing.

**pr-review-toolkit**: Comprehensive PR review agents specializing in comments, tests, error handling, type design, code quality, and code simplification. Use for thorough multi-aspect PR reviews.

**ralph-loop**: Continuous self-referential AI loops for interactive iterative development, implementing the Ralph Wiggum technique. Run Claude in a while-true loop with the same prompt until task completion. Use for iterative refinement tasks.

**security-guidance**: Security reminder hook that warns about potential security issues when editing files, including command injection, XSS, and unsafe code patterns. Automatically active during file edits.

**serena**: Semantic code analysis MCP server providing intelligent code understanding, refactoring suggestions, and codebase navigation through language server protocol integration. Use for deep code analysis.

**supabase**: Supabase MCP integration for database operations, authentication, storage, and real-time subscriptions. Manage your Supabase projects, run SQL queries, and interact with your backend directly. Use for Supabase operations beyond local CLI.

**superpowers**: Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques. Essential workflow skills used throughout development.

**typescript-lsp**: TypeScript/JavaScript language server for enhanced code intelligence. Provides type checking, IntelliSense, and language features. Use for advanced TypeScript analysis.

### MCP Servers

Configured in `.mcp.json`. Tools available automatically:

**shadcn MCP** (`bunx shadcn@latest mcp`):

- Search and view shadcn/ui components and examples
- Get CLI commands to add components to project
- Use when adding new UI components or exploring component options
- Tools: `mcp__shadcn__search_items_in_registries`, `mcp__shadcn__view_items_in_registries`, `mcp__shadcn__get_item_examples_from_registries`

**Supabase MCP** (`http://localhost:54321/mcp`):

- Direct access to local Supabase instance
- Query database, check auth state, manage schema
- Use when debugging Supabase issues or exploring database state
- Requires local Supabase running (`supabase start`)

### Plugin vs MCP Distinction

**Plugins/Skills**: High-level workflows and guided processes invoked via Skill tool:

- Commit workflow (`commit-commands:commit`)
- Feature planning (`superpowers:writing-plans`)
- Code review (`code-review:code-review`)
- TDD workflow (`superpowers:test-driven-development`)
- Use for development processes and workflow automation

**MCP Servers**: Direct API/tool access to external services automatically available:

- Supabase queries (database operations)
- shadcn component search (UI component discovery)
- GitHub API (repository management)
- Playwright (browser automation)
- Use for service integration and external API interactions

**Key Difference**: Invoke skills explicitly when you need guided workflows; MCP tools are always available for direct service access.

## Maintaining CLAUDE.md

When updating this file:

- Use `claude-md-management:revise-claude-md` to capture session learnings
- Use `claude-md-management:claude-md-improver` for quality audits
- Keep entries concise - CLAUDE.md is part of the prompt, brevity matters
- Use text markers [GOOD], [BAD], [NOTE] instead of emojis
- MCP config is in `.mcp.json` at project root
