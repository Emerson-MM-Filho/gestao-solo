# Software Design Document (SDD): GESTAO SOLO

## Document Information

| Field | Value |
|-------|-------|
| **Document Title** | Software Design Document - Gestao Solo |
| **Version** | 1.0 |
| **Date** | January 2026 |
| **Standard** | IEEE 1016-2009 |
| **Related Documents** | SRS.md, CLAUDE.md |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Component Design](#3-component-design)
4. [Data Design](#4-data-design)
5. [Interface Design](#5-interface-design)
6. [Security Design](#6-security-design)
7. [Performance Design](#7-performance-design)
8. [Error Handling and Logging](#8-error-handling-and-logging)
9. [Traceability Matrix](#9-traceability-matrix)

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) provides a comprehensive architectural and detailed design description for the **Gestao Solo** system. It transforms the functional and non-functional requirements defined in SRS.md into implementable design specifications following IEEE 1016 standards.

The document serves as the primary technical reference for:
- Development team implementing system features
- Quality assurance for validation against requirements
- Future maintainers understanding system architecture

### 1.2 Scope

Gestao Solo is a Progressive Web Application (PWA) designed for sales and inventory management in micro-operations (small cafes, restaurants, bars). The system provides:

- Nominal order management (comandas)
- Simplified Point of Sale (PDV) for merchandise sales
- Hybrid inventory management (automatic and manual stock adjustments)
- Replenishment alerts and basic financial reporting

**Explicit Exclusions (per SRS.md Section 2.3):**
- Payment processing (informational recording only)
- Fiscal document generation (no invoice/receipt issuance)
- Customer Relationship Management (no persistent customer records)
- Automatic error correction (manual user intervention required)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **PWA** | Progressive Web App - web application installable on devices |
| **PDV** | Ponto de Venda (Point of Sale) |
| **Comanda** | Named order/tab associated with a customer name |
| **Mercadoria** | Merchandise - finished products for sale with automatic stock deduction |
| **Insumo** | Supply - support items (napkins, milk, packaging) with manual stock control only |
| **RLS** | Row Level Security - Supabase database security feature |
| **i18n** | Internationalization - multi-language support |

### 1.4 References

- **SRS.md** - Software Requirements Specification for Gestao Solo
- **CLAUDE.md** - Development guidelines and architectural decisions
- **IEEE 1016-2009** - Standard for Information Technology - Software Design Descriptions
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Router Documentation](https://tanstack.com/router)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 2. System Architecture

### 2.1 Architectural Overview

Gestao Solo follows a **client-heavy Single Page Application (SPA) architecture** with a Backend-as-a-Service (BaaS) pattern using Supabase. This architecture was chosen to:

1. **Maximize offline capability** (RNF03) - Client handles business logic locally
2. **Minimize operational complexity** - No custom backend to maintain
3. **Leverage real-time features** - Supabase provides built-in real-time subscriptions
4. **Enable rapid development** - Pre-built authentication, database, and storage

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (PWA)                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    React Application                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │  Routes  │  │Components│  │  Hooks   │  │   Lib    │    │   │
│  │  │(TanStack)│  │(shadcn)  │  │          │  │(Supabase)│    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Local Storage / IndexedDB                       │   │
│  │         (Offline Data + Session + Preferences)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS (REST API / Realtime WS)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   Auth   │  │ Database │  │ Realtime │  │ Storage  │           │
│  │(GoTrue)  │  │(Postgres)│  │   (WS)   │  │  (S3)    │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Row Level Security (RLS)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Style

The system employs a **Layered Architecture** within the client application:

| Layer | Responsibility | Key Technologies |
|-------|---------------|------------------|
| **Presentation** | UI rendering, user interaction | React, shadcn/ui, Tailwind CSS |
| **Routing** | Navigation, route guards, code splitting | TanStack Router |
| **Business Logic** | Form validation, data transformation | Custom hooks, utility functions |
| **Data Access** | API communication, caching, sync | Supabase JS Client |
| **Persistence** | Local storage, offline data | localStorage, IndexedDB |

### 2.3 Technology Stack

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **UI Framework** | React | 19.x | Modern features, large ecosystem |
| **Language** | TypeScript | 5.9.x | Type safety, improved DX |
| **Routing** | TanStack Router | 1.154.x | Type-safe, file-based, code splitting |
| **Styling** | Tailwind CSS | 4.x | Utility-first, mobile-first design |
| **UI Components** | shadcn/ui (Radix Nova) | Latest | Accessible, customizable, owned code |
| **Icons** | Tabler Icons | 3.x | Consistent, comprehensive icon set |
| **Backend** | Supabase | 2.x | Auth, DB, Realtime in one service |
| **i18n** | i18next + react-i18next | 25.x | Mature, TypeScript support |
| **Build Tool** | Vite | 7.x | Fast HMR, optimized builds |
| **Package Manager** | Bun | Latest | Fast installation, native TypeScript |

### 2.4 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT TOPOLOGY                              │
│                                                                     │
│  ┌─────────────────────┐      ┌─────────────────────┐              │
│  │   GitHub Actions    │      │   Supabase Cloud    │              │
│  │   (CI/CD Pipeline)  │      │   (Hosted Backend)  │              │
│  └──────────┬──────────┘      └──────────┬──────────┘              │
│             │                            │                          │
│             ▼                            │                          │
│  ┌─────────────────────┐                 │                          │
│  │   GitHub Pages      │◄────────────────┘                          │
│  │   (Static Hosting)  │   API Calls                                │
│  │                     │                                            │
│  │  ┌───────────────┐  │                                            │
│  │  │  index.html   │  │                                            │
│  │  │  404.html     │  │  ◄── SPA fallback routing                  │
│  │  │  assets/      │  │                                            │
│  │  └───────────────┘  │                                            │
│  └─────────────────────┘                                            │
│                                                                     │
│  Environment Configuration:                                         │
│  - .env.local      → Local Supabase instance                       │
│  - .env.production → Supabase Cloud                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Deployment Considerations:**
- Static assets hosted on GitHub Pages with custom domain support
- `404.html` copied from `index.html` enables SPA routing on direct URL access
- Environment-specific configuration via Vite's `loadEnv`
- Base path configurable via `VITE_BASE_PATH` for subdirectory hosting

### 2.5 Design Rationale

| Decision | Rationale | Addresses Requirements |
|----------|-----------|----------------------|
| **SPA Architecture** | Single deployment, offline-capable, fast navigation | RNF02, RNF03 |
| **Supabase BaaS** | Reduces operational complexity, built-in auth/realtime | RNF05, RNF07 |
| **File-based Routing** | Explicit structure, automatic code splitting | RNF04 |
| **Mobile-first CSS** | Primary use case is smartphone operation | RNF01 |
| **Bilingual i18n** | Serves Portuguese (primary) and English markets | Business requirement |
| **shadcn/ui** | Owned code, accessible by default, Tailwind-native | RNF01 (accessibility) |

---

## 3. Component Design

### 3.1 Component Hierarchy

```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Root component with providers
├── i18n.tsx                    # Internationalization configuration
├── routeTree.gen.ts            # Auto-generated route tree (DO NOT EDIT)
│
├── routes/                     # File-based routing
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Landing page (/)
│   ├── auth/                   # Authentication routes
│   │   ├── route.tsx           # Auth layout
│   │   ├── signin.tsx          # Sign in page
│   │   └── signup.tsx          # Sign up page
│   └── _authenticated/         # Protected routes (requires auth)
│       ├── _authenticated.tsx  # Auth guard layout
│       ├── dashboard.tsx       # Main dashboard
│       ├── comandas/           # Order management [RF01, RF02, RF03, RF12, RF13]
│       │   ├── index.tsx       # Comandas list
│       │   ├── $comandaId.tsx  # Single comanda view/edit
│       │   └── new.tsx         # New comanda creation
│       ├── estoque/            # Inventory management [RF04, RF05, RF06, RF07]
│       │   ├── index.tsx       # Stock overview with alerts
│       │   ├── items/          # Item management
│       │   │   ├── index.tsx   # Items list
│       │   │   ├── $itemId.tsx # Item details/edit
│       │   │   └── new.tsx     # New item creation
│       │   └── movimentacoes.tsx # Stock movements history
│       ├── relatorios/         # Reporting [RF08, RF09]
│       │   ├── index.tsx       # Reports dashboard
│       │   ├── vendas.tsx      # Sales reports
│       │   └── estoque.tsx     # Inventory reports
│       └── configuracoes/      # Settings
│           └── index.tsx       # User preferences, backup/restore
│
├── components/                 # Reusable components
│   ├── ui/                     # shadcn/ui primitives (managed by CLI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── auth-provider.tsx       # Authentication context
│   ├── theme-provider.tsx      # Theme (dark/light) context
│   ├── app-sidebar.tsx         # Navigation sidebar
│   ├── language-toggle.tsx     # PT/EN language switcher
│   │
│   ├── comandas/               # Comanda-specific components
│   │   ├── comanda-card.tsx    # Comanda preview card
│   │   ├── comanda-form.tsx    # Create/edit comanda form
│   │   ├── item-selector.tsx   # Product selection interface [RF10]
│   │   ├── payment-form.tsx    # Payment registration [RF03, RF13]
│   │   └── comanda-actions.tsx # Cancel, close actions [RF12]
│   │
│   ├── estoque/                # Inventory-specific components
│   │   ├── item-card.tsx       # Item with stock indicator
│   │   ├── item-form.tsx       # Create/edit item form [RF04, RF11]
│   │   ├── stock-badge.tsx     # Visual stock status [RF07]
│   │   ├── stock-adjustment.tsx # Manual stock entry [RF06]
│   │   └── alert-banner.tsx    # Low stock alerts [RF09]
│   │
│   └── relatorios/             # Report components
│       ├── date-range-picker.tsx # Period selection [RF08]
│       ├── sales-summary.tsx   # Sales overview
│       ├── export-buttons.tsx  # PDF/CSV/Print [RF08]
│       └── chart-wrapper.tsx   # Chart visualizations
│
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts           # Mobile detection
│   ├── use-comandas.ts         # Comandas CRUD operations
│   ├── use-items.ts            # Items CRUD operations
│   ├── use-stock.ts            # Stock queries and mutations
│   └── use-offline-sync.ts     # Offline data synchronization [RNF03]
│
├── lib/                        # Utility functions
│   ├── supabase.ts             # Supabase client singleton
│   ├── utils.ts                # General utilities (cn, formatters)
│   ├── auth-utils.ts           # Authentication helpers
│   ├── validators.ts           # Form validation functions
│   └── types/                  # TypeScript type definitions
│       ├── auth.ts
│       ├── comanda.ts
│       ├── item.ts
│       └── database.ts         # Supabase generated types
│
├── locales/                    # i18n translation files
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── comandas.json
│   │   ├── estoque.json
│   │   ├── relatorios.json
│   │   └── errors.json
│   └── pt/
│       └── ... (mirror structure)
│
└── @types/                     # TypeScript declarations
    ├── resources.ts            # i18n namespace registry
    └── i18next.d.ts            # i18n type augmentation
```

### 3.2 Core Component Specifications

#### 3.2.1 Authentication Guard Component

**File:** `src/routes/_authenticated.tsx`

**Purpose:** Protects all child routes requiring authentication. Addresses RNF05.

**Interface:**
```typescript
// Route configuration with beforeLoad guard
export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: "/auth/signin",
        search: { redirect: location.href },
      });
    }
    return { session };
  },
});
```

**Behavior:**
1. Before rendering any child route, checks for valid Supabase session
2. If no session, redirects to `/auth/signin` with return URL
3. Provides session context to child routes via route context
4. Session automatically refreshes via Supabase client configuration

**Design Decision:** Using TanStack Router's `beforeLoad` instead of React context guards ensures authentication check happens before any protected component renders, preventing flash of authenticated content.

#### 3.2.2 Item Selector Component

**File:** `src/components/comandas/item-selector.tsx`

**Purpose:** Provides fast, mobile-optimized product selection for adding items to comandas. Addresses RF02, RF10.

**Interface:**
```typescript
interface ItemSelectorProps {
  onSelectItem: (item: Item, quantity: number, observation?: string) => void;
  excludeOutOfStock?: boolean;
}

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  type: 'merchandise' | 'supply';
  stock_quantity: number;
  is_favorite: boolean;
  usage_count: number;
}
```

**Features:**
- Fuzzy search by item name (RF10)
- Category filtering (RF10)
- Configurable sort order: Alphabetical, Favorites, Most Used (RF10)
- Grid and list view toggle (RF10)
- Touch-optimized 48x48px minimum tap targets (RNF01)
- Out-of-stock items visually distinguished and optionally hidden
- Quantity selector with +/- buttons
- Optional observation text field

**State Management:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [sortOrder, setSortOrder] = useState<'alpha' | 'favorite' | 'usage'>('favorite');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
```

**Performance Considerations:**
- Debounced search input (150ms)
- Virtual scrolling for lists > 50 items
- Memoized filtered/sorted results

#### 3.2.3 Stock Badge Component

**File:** `src/components/estoque/stock-badge.tsx`

**Purpose:** Visual indicator of stock status with configurable thresholds. Addresses RF07.

**Interface:**
```typescript
interface StockBadgeProps {
  quantity: number;
  criticalThreshold?: number;  // Default: 2
  lowThreshold?: number;       // Default: 5
  showQuantity?: boolean;
}

type StockStatus = 'critical' | 'low' | 'ok';
```

**Visual Design:**
| Status | Condition | Color | Icon |
|--------|-----------|-------|------|
| Critical | quantity <= criticalThreshold | Red (destructive) | Alert triangle |
| Low | quantity <= lowThreshold | Yellow (warning) | Info circle |
| OK | quantity > lowThreshold | Green (success) | Check circle |

**Implementation:**
```typescript
function getStockStatus(
  quantity: number,
  critical: number,
  low: number
): StockStatus {
  if (quantity <= critical) return 'critical';
  if (quantity <= low) return 'low';
  return 'ok';
}
```

#### 3.2.4 Payment Form Component

**File:** `src/components/comandas/payment-form.tsx`

**Purpose:** Handles single and multiple payment methods for comanda closure. Addresses RF03, RF13.

**Interface:**
```typescript
interface PaymentFormProps {
  totalAmount: number;
  onSubmit: (payments: Payment[]) => void;
  onCancel: () => void;
}

interface Payment {
  method: 'pix' | 'credit' | 'debit' | 'cash';
  amount: number;
}
```

**Validation Rules (RF13):**
- Sum of all payment amounts must equal totalAmount exactly
- Partial payments not allowed (comanda must be fully paid)
- At least one payment method required
- Each payment amount must be > 0

**UI Flow:**
1. Display total amount prominently
2. Single payment mode by default (one method, full amount)
3. "Split payment" toggle enables multiple payment entry
4. Running total shows remaining balance
5. Submit disabled until balance is zero

### 3.3 Component Interaction Patterns

#### 3.3.1 Comanda Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMANDA LIFECYCLE                                │
│                                                                     │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐ │
│   │  CREATE  │────▶│   OPEN   │────▶│ CLOSING  │────▶│  CLOSED  │ │
│   │          │     │          │     │          │     │          │ │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘ │
│        │                │                │                │        │
│        │                │                │                │        │
│        ▼                ▼                ▼                ▼        │
│   - Customer name  - Add items     - Payment form   - Stock        │
│   - Timestamp      - Edit items    - Validate total   deducted     │
│                    - Remove items  - Multi-payment  - Saved to     │
│                    - Observations                     history      │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │                     CANCEL FLOW (RF12)                        │ │
│   │   From OPEN or CLOSED → CANCELLED                             │ │
│   │   - User selects: Return stock / Keep stock consumed          │ │
│   │   - Comanda marked cancelled, retained for audit              │ │
│   └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Stock Adjustment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STOCK ADJUSTMENT SOURCES                         │
│                                                                     │
│   ┌─────────────────┐                                              │
│   │  Comanda Close  │──────┐                                       │
│   │  (Automatic)    │      │                                       │
│   └─────────────────┘      │                                       │
│                            │    ┌──────────────────┐               │
│   ┌─────────────────┐      ├───▶│  Stock Balance   │               │
│   │ Manual Entrada  │──────┤    │    (per item)    │               │
│   │ (Purchases)     │      │    └──────────────────┘               │
│   └─────────────────┘      │              │                        │
│                            │              ▼                        │
│   ┌─────────────────┐      │    ┌──────────────────┐               │
│   │  Manual Saida   │──────┤    │  Stock Movement  │               │
│   │ (Losses/Usage)  │      │    │     History      │               │
│   └─────────────────┘      │    └──────────────────┘               │
│                            │              │                        │
│   ┌─────────────────┐      │              ▼                        │
│   │ Comanda Cancel  │──────┘    ┌──────────────────┐               │
│   │ (Optional)      │           │   Alert Engine   │               │
│   └─────────────────┘           │ (RF07, RF09)     │               │
│                                 └──────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 State Management Design

#### 3.4.1 State Categories

| Category | Storage | Scope | Sync Strategy |
|----------|---------|-------|---------------|
| **Auth State** | Supabase + localStorage | Global | Real-time via Supabase |
| **User Preferences** | localStorage | Global | Local only |
| **i18n Language** | localStorage | Global | Local only |
| **Theme** | localStorage | Global | Local only |
| **Business Data** | Supabase + IndexedDB | Per-user (RLS) | Offline-first, sync on connect |
| **UI State** | React state | Component | None (ephemeral) |

#### 3.4.2 Offline-First Data Flow (RNF03)

```typescript
// Conceptual offline sync hook
function useOfflineSync<T>(
  tableName: string,
  query: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // 1. Load from IndexedDB first (instant)
    loadFromIndexedDB(tableName).then(setData);

    // 2. If online, fetch fresh data and sync
    if (isOnline) {
      query().then(freshData => {
        setData(freshData);
        saveToIndexedDB(tableName, freshData);
        // Replay pending changes
        replayPendingChanges(pendingChanges);
      });
    }
  }, [isOnline]);

  const mutate = async (change: Change) => {
    // Optimistic update
    setData(applyChange(data, change));

    if (isOnline) {
      await applyToSupabase(change);
    } else {
      // Queue for later sync
      setPendingChanges([...pendingChanges, change]);
      saveToIndexedDB('pending_changes', [...pendingChanges, change]);
    }
  };

  return { data, mutate, isOnline, hasPendingChanges: pendingChanges.length > 0 };
}
```

---

## 4. Data Design

### 4.1 Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                             │
│                                                                     │
│   ┌─────────────┐         ┌─────────────────┐                      │
│   │    users    │         │   user_profiles │                      │
│   │ (Supabase)  │────────▶│                 │                      │
│   └─────────────┘    1:1  └─────────────────┘                      │
│         │                          │                                │
│         │ 1:N                      │                                │
│         ▼                          ▼                                │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                         items                                │  │
│   │  (id, user_id, name, type, price, category, stock_quantity, │  │
│   │   critical_threshold, low_threshold, is_favorite, ...)      │  │
│   └─────────────────────────────────────────────────────────────┘  │
│         │                                                          │
│         │ 1:N                                                      │
│         ▼                                                          │
│   ┌─────────────────┐              ┌─────────────────┐            │
│   │ stock_movements │              │    comandas     │            │
│   │                 │              │                 │            │
│   └─────────────────┘              └─────────────────┘            │
│                                          │                        │
│                                          │ 1:N                    │
│                                          ▼                        │
│                                    ┌─────────────────┐            │
│                                    │  comanda_items  │            │
│                                    └─────────────────┘            │
│                                          │                        │
│                                          │ N:1                    │
│                                          ▼                        │
│                                    ┌─────────────────┐            │
│                                    │     items       │            │
│                                    └─────────────────┘            │
│                                                                    │
│   ┌─────────────────┐                                             │
│   │    payments     │◄────────── N:1 ──── comandas                │
│   └─────────────────┘                                             │
│                                                                    │
│   ┌─────────────────┐                                             │
│   │  price_history  │◄────────── N:1 ──── items                   │
│   └─────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Database Schema (DDL)

```sql
-- =============================================================================
-- GESTAO SOLO DATABASE SCHEMA
-- Supabase PostgreSQL with Row Level Security
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- USER PROFILES (extends Supabase auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),  -- E.164 format
  preferred_language VARCHAR(5) DEFAULT 'pt',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own profile
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- CATEGORIES (for item organization) [RF10]
-- -----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- ITEMS (Mercadorias e Insumos) [RF04, RF07, RF10, RF11]
-- -----------------------------------------------------------------------------
CREATE TYPE item_type AS ENUM ('merchandise', 'supply');

CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  name VARCHAR(100) NOT NULL,
  type item_type NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),

  stock_quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,  -- Supports fractional (kg, L)
  critical_threshold DECIMAL(10, 3) NOT NULL DEFAULT 2,
  low_threshold DECIMAL(10, 3) NOT NULL DEFAULT 5,

  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,  -- For "most used" sorting

  is_active BOOLEAN DEFAULT TRUE,  -- Soft delete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_thresholds CHECK (critical_threshold <= low_threshold)
);

CREATE INDEX idx_items_user_active ON public.items(user_id, is_active);
CREATE INDEX idx_items_category ON public.items(category_id);
CREATE INDEX idx_items_stock_alert ON public.items(user_id, stock_quantity, low_threshold)
  WHERE is_active = TRUE AND type = 'merchandise';

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own items"
  ON public.items FOR ALL
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- PRICE HISTORY [RF11]
-- -----------------------------------------------------------------------------
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_item ON public.price_history(item_id, changed_at DESC);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own item price history"
  ON public.price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = price_history.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Trigger to record price changes
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.price_history (item_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_price_change
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION record_price_change();

-- -----------------------------------------------------------------------------
-- STOCK MOVEMENTS [RF05, RF06]
-- -----------------------------------------------------------------------------
CREATE TYPE movement_type AS ENUM (
  'entry',      -- Manual purchase entry
  'manual_exit', -- Manual loss/usage
  'sale',        -- Automatic from comanda close
  'reversal'       -- Stock return from cancelled comanda
);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  comanda_id UUID REFERENCES public.comandas(id) ON DELETE SET NULL,

  type movement_type NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,  -- Positive for entry/reversal, negative for exit
  balance_after DECIMAL(10, 3) NOT NULL,  -- Stock balance after movement

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_item ON public.stock_movements(item_id, created_at DESC);
CREATE INDEX idx_stock_movements_comanda ON public.stock_movements(comanda_id);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stock movements"
  ON public.stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = stock_movements.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own stock movements"
  ON public.stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = stock_movements.item_id
      AND items.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- COMANDAS [RF01, RF12]
-- -----------------------------------------------------------------------------
CREATE TYPE comanda_status AS ENUM ('open', 'closed', 'cancelled');

CREATE TABLE public.comandas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  customer_name VARCHAR(100) NOT NULL,
  status comanda_status NOT NULL DEFAULT 'open',

  total_amount DECIMAL(10, 2) DEFAULT 0,
  closed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  stock_returned BOOLEAN,  -- NULL if not cancelled, TRUE/FALSE if cancelled [RF12]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comandas_user_status ON public.comandas(user_id, status);
CREATE INDEX idx_comandas_user_date ON public.comandas(user_id, created_at DESC);

ALTER TABLE public.comandas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own comandas"
  ON public.comandas FOR ALL
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- COMANDA ITEMS [RF02, RF11]
-- -----------------------------------------------------------------------------
CREATE TABLE public.comanda_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_id UUID NOT NULL REFERENCES public.comandas(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,

  quantity DECIMAL(10, 3) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,  -- Price at time of addition [RF11]
  observation TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comanda_items_comanda ON public.comanda_items(comanda_id);

ALTER TABLE public.comanda_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own comanda items"
  ON public.comanda_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.comandas
      WHERE comandas.id = comanda_items.comanda_id
      AND comandas.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- PAYMENTS [RF03, RF13]
-- -----------------------------------------------------------------------------
CREATE TYPE payment_method AS ENUM ('pix', 'credit', 'debit', 'cash');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comanda_id UUID NOT NULL REFERENCES public.comandas(id) ON DELETE CASCADE,

  method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_comanda ON public.payments(comanda_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.comandas
      WHERE comandas.id = payments.comanda_id
      AND comandas.user_id = auth.uid()
    )
  );

-- =============================================================================
-- VIEWS FOR REPORTING [RF08]
-- =============================================================================

-- Daily sales summary
CREATE VIEW public.v_daily_sales AS
SELECT
  c.user_id,
  DATE(c.closed_at) as sale_date,
  COUNT(c.id) as total_comandas,
  SUM(c.total_amount) as total_revenue,
  SUM(CASE WHEN p.method = 'pix' THEN p.amount ELSE 0 END) as pix_total,
  SUM(CASE WHEN p.method = 'credit' THEN p.amount ELSE 0 END) as credit_total,
  SUM(CASE WHEN p.method = 'debit' THEN p.amount ELSE 0 END) as debit_total,
  SUM(CASE WHEN p.method = 'cash' THEN p.amount ELSE 0 END) as cash_total
FROM public.comandas c
LEFT JOIN public.payments p ON c.id = p.comanda_id
WHERE c.status = 'closed'
GROUP BY c.user_id, DATE(c.closed_at);

-- Items needing restock
CREATE VIEW public.v_low_stock_items AS
SELECT
  i.id,
  i.user_id,
  i.name,
  i.type,
  i.stock_quantity,
  i.critical_threshold,
  i.low_threshold,
  CASE
    WHEN i.stock_quantity <= i.critical_threshold THEN 'critical'
    WHEN i.stock_quantity <= i.low_threshold THEN 'low'
    ELSE 'ok'
  END as stock_status
FROM public.items i
WHERE i.is_active = TRUE
  AND i.stock_quantity <= i.low_threshold;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to close comanda and deduct stock [RF03, RF05]
CREATE OR REPLACE FUNCTION close_comanda(
  p_comanda_id UUID,
  p_payments JSONB  -- Array of {method, amount}
)
RETURNS JSONB AS $$
DECLARE
  v_comanda RECORD;
  v_payment RECORD;
  v_item RECORD;
  v_total_paid DECIMAL(10, 2) := 0;
BEGIN
  -- Get comanda
  SELECT * INTO v_comanda FROM public.comandas WHERE id = p_comanda_id;

  IF v_comanda IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comanda not found');
  END IF;

  IF v_comanda.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comanda is not open');
  END IF;

  -- Validate payments total
  SELECT SUM((p->>'amount')::DECIMAL) INTO v_total_paid
  FROM jsonb_array_elements(p_payments) p;

  IF v_total_paid != v_comanda.total_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment total does not match comanda total');
  END IF;

  -- Insert payments
  FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
  LOOP
    INSERT INTO public.payments (comanda_id, method, amount)
    VALUES (
      p_comanda_id,
      (v_payment.value->>'method')::payment_method,
      (v_payment.value->>'amount')::DECIMAL
    );
  END LOOP;

  -- Deduct stock for merchandise items
  FOR v_item IN
    SELECT ci.item_id, ci.quantity, i.type, i.stock_quantity
    FROM public.comanda_items ci
    JOIN public.items i ON ci.item_id = i.id
    WHERE ci.comanda_id = p_comanda_id
      AND i.type = 'merchandise'
  LOOP
    -- Update stock
    UPDATE public.items
    SET stock_quantity = stock_quantity - v_item.quantity,
        usage_count = usage_count + 1
    WHERE id = v_item.item_id;

    -- Record movement
    INSERT INTO public.stock_movements (item_id, comanda_id, type, quantity, balance_after)
    VALUES (
      v_item.item_id,
      p_comanda_id,
      'sale',
      -v_item.quantity,
      v_item.stock_quantity - v_item.quantity
    );
  END LOOP;

  -- Update comanda status
  UPDATE public.comandas
  SET status = 'closed', closed_at = NOW(), updated_at = NOW()
  WHERE id = p_comanda_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel comanda [RF12]
CREATE OR REPLACE FUNCTION cancel_comanda(
  p_comanda_id UUID,
  p_return_stock BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_comanda RECORD;
  v_item RECORD;
BEGIN
  -- Get comanda
  SELECT * INTO v_comanda FROM public.comandas WHERE id = p_comanda_id;

  IF v_comanda IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comanda not found');
  END IF;

  IF v_comanda.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Comanda already cancelled');
  END IF;

  -- If closed and returning stock, restore quantities
  IF v_comanda.status = 'closed' AND p_return_stock THEN
    FOR v_item IN
      SELECT ci.item_id, ci.quantity, i.stock_quantity
      FROM public.comanda_items ci
      JOIN public.items i ON ci.item_id = i.id
      WHERE ci.comanda_id = p_comanda_id
        AND i.type = 'merchandise'
    LOOP
      UPDATE public.items
      SET stock_quantity = stock_quantity + v_item.quantity
      WHERE id = v_item.item_id;

      INSERT INTO public.stock_movements (item_id, comanda_id, type, quantity, balance_after, notes)
      VALUES (
        v_item.item_id,
        p_comanda_id,
        'reversal',
        v_item.quantity,
        v_item.stock_quantity + v_item.quantity,
        'Comanda cancelled with stock return'
      );
    END LOOP;
  END IF;

  -- Update comanda status
  UPDATE public.comandas
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_reason,
    stock_returned = p_return_stock,
    updated_at = NOW()
  WHERE id = p_comanda_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 Data Validation Rules

| Entity | Field | Validation | Source |
|--------|-------|------------|--------|
| Item | price | >= 0 | Database CHECK |
| Item | thresholds | critical <= low | Database CHECK |
| Comanda Item | quantity | > 0 | Database CHECK |
| Payment | amount | > 0 | Database CHECK |
| Comanda Close | payment sum | = total_amount | Function logic |
| User Profile | display_name | 1-50 chars | Application validation |
| User Profile | phone | E.164 format | Application regex |

### 4.4 Data Integrity and Backup (RNF07)

**Export Format:**
```typescript
interface BackupData {
  version: string;
  exportedAt: string;
  userId: string;
  data: {
    categories: Category[];
    items: Item[];
    comandas: Comanda[];
    comandaItems: ComandaItem[];
    payments: Payment[];
    stockMovements: StockMovement[];
    priceHistory: PriceHistoryEntry[];
  };
}
```

**Export Implementation:**
- JSON format for structured data
- Includes all user data with relationships
- Version number for migration compatibility
- User responsible for periodic manual exports

**Import Validation:**
- Version compatibility check
- Referential integrity verification
- Duplicate detection (skip or overwrite strategy)
- Transaction-wrapped for atomicity

---

## 5. Interface Design

### 5.1 User Interface Design

#### 5.1.1 Mobile-First Layout System (RNF01)

```
┌────────────────────────────────────────┐
│  MOBILE LAYOUT (< 768px)               │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ HEADER                           │  │
│  │ [Menu] Title          [Actions]  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │                                  │  │
│  │         MAIN CONTENT             │  │
│  │      (Full width, scrollable)    │  │
│  │                                  │  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ BOTTOM NAV (optional)            │  │
│  │ [Home] [Orders] [Stock] [More]   │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  DESKTOP LAYOUT (>= 768px)                               │
│                                                          │
│  ┌────────┬───────────────────────────────────────────┐  │
│  │        │ HEADER                                    │  │
│  │        │ [Breadcrumb]                    [User]    │  │
│  │        ├───────────────────────────────────────────┤  │
│  │  SIDE  │                                           │  │
│  │  BAR   │                                           │  │
│  │        │              MAIN CONTENT                 │  │
│  │ [Nav]  │                                           │  │
│  │        │                                           │  │
│  │        │                                           │  │
│  │        │                                           │  │
│  │ [User] │                                           │  │
│  └────────┴───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

#### 5.1.2 Touch Target Guidelines (RNF01)

| Element | Minimum Size | Spacing |
|---------|-------------|---------|
| Buttons | 48x48px | 8px between |
| List items | 48px height | 4px vertical |
| Form inputs | 48px height | 16px margin-bottom |
| Icons (tappable) | 48x48px touch area | - |

#### 5.1.3 Typography Scale

| Element | Size | Weight | Use Case |
|---------|------|--------|----------|
| Page Title | 24px (1.5rem) | 600 | Main headings |
| Section Title | 18px (1.125rem) | 600 | Card headers |
| Body | 16px (1rem) | 400 | Default text (min for readability) |
| Label | 14px (0.875rem) | 500 | Form labels |
| Caption | 12px (0.75rem) | 400 | Secondary info |

#### 5.1.4 Key Screen Wireframes

**Comandas List (Mobile)**
```
┌────────────────────────────────────┐
│ [=] Comandas                 [+]   │
├────────────────────────────────────┤
│ [Search...]                 [Filt] │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ Maria Silva            R$45,00 │ │
│ │ 3 itens • Aberta há 25min      │ │
│ │                         [→]    │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ João Pedro             R$67,50 │ │
│ │ 5 itens • Aberta há 1h12m      │ │
│ │                         [→]    │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Ana Costa              R$23,00 │ │
│ │ 2 itens • Aberta há 8min       │ │
│ │                         [→]    │ │
│ └────────────────────────────────┘ │
│              ...                   │
└────────────────────────────────────┘
```

**Item Selection (Mobile) - RF10**
```
┌────────────────────────────────────┐
│ [<] Adicionar Item                 │
├────────────────────────────────────┤
│ [Search items...              🔍]  │
├────────────────────────────────────┤
│ [Todas] [Bebidas] [Comidas] [...]  │
├────────────────────────────────────┤
│ Sort: [★ Favoritos ▼]  View: [⊞][≡]│
├────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │  ☕     │ │  🥐    │ │  🥤    ││
│ │ Café    │ │Croissant│ │ Suco   ││
│ │ R$5,00  │ │ R$8,00  │ │ R$7,00 ││
│ │ [█████] │ │ [███  ] │ │ [█    ]││
│ │   OK    │ │  Low    │ │Critical││
│ └─────────┘ └─────────┘ └─────────┘│
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │  🍰     │ │  🧁    │ │  🍵    ││
│ │  Bolo   │ │Cupcake  │ │ Chá    ││
│ │ R$12,00 │ │ R$6,00  │ │ R$4,00 ││
│ └─────────┘ └─────────┘ └─────────┘│
└────────────────────────────────────┘
```

**Stock Overview with Alerts - RF07, RF09**
```
┌────────────────────────────────────┐
│ [=] Estoque                        │
├────────────────────────────────────┤
│ ⚠️ 3 itens precisam reposição     │
│ [Ver todos →]                      │
├────────────────────────────────────┤
│                                    │
│ CRÍTICO (2)                        │
│ ┌────────────────────────────────┐ │
│ │ 🔴 Suco de Laranja        1    │ │
│ │ 🔴 Leite                  0    │ │
│ └────────────────────────────────┘ │
│                                    │
│ BAIXO (1)                          │
│ ┌────────────────────────────────┐ │
│ │ 🟡 Croissant              3    │ │
│ └────────────────────────────────┘ │
│                                    │
│ OK (15)                            │
│ ┌────────────────────────────────┐ │
│ │ 🟢 Café                   45   │ │
│ │ 🟢 Açúcar                120   │ │
│ │    ...                         │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### 5.2 API Interface Design

#### 5.2.1 Supabase Client Configuration

**File:** `src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage,
  },
});
```

#### 5.2.2 Data Access Patterns

**Items CRUD:**
```typescript
// Fetch all active items with stock status
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    category:categories(id, name)
  `)
  .eq('is_active', true)
  .order('name');

// Create new item
const { data, error } = await supabase
  .from('items')
  .insert({
    name: 'Café Expresso',
    type: 'merchandise',
    price: 5.00,
    category_id: categoryId,
    stock_quantity: 100,
    critical_threshold: 10,
    low_threshold: 25
  })
  .select()
  .single();

// Update item price (triggers price_history via DB trigger)
const { error } = await supabase
  .from('items')
  .update({ price: 6.00 })
  .eq('id', itemId);
```

**Comanda Operations:**
```typescript
// Open new comanda (2 touches max - RNF01)
const { data, error } = await supabase
  .from('comandas')
  .insert({ customer_name: 'Maria' })
  .select()
  .single();

// Add item to comanda (3 touches max - RNF01)
const { error } = await supabase
  .from('comanda_items')
  .insert({
    comanda_id: comandaId,
    item_id: itemId,
    quantity: 1,
    unit_price: currentItemPrice,
    observation: 'Sem açúcar'
  });

// Close comanda with payments
const { data, error } = await supabase
  .rpc('close_comanda', {
    p_comanda_id: comandaId,
    p_payments: [
      { method: 'pix', amount: 30.00 },
      { method: 'cash', amount: 15.50 }
    ]
  });

// Cancel comanda
const { data, error } = await supabase
  .rpc('cancel_comanda', {
    p_comanda_id: comandaId,
    p_return_stock: true,
    p_reason: 'Customer changed mind'
  });
```

**Reporting Queries:**
```typescript
// Sales report with date range [RF08]
const { data, error } = await supabase
  .from('v_daily_sales')
  .select('*')
  .gte('sale_date', startDate)
  .lte('sale_date', endDate);

// Low stock items [RF09]
const { data, error } = await supabase
  .from('v_low_stock_items')
  .select('*')
  .in('stock_status', ['critical', 'low']);

// Top selling items
const { data, error } = await supabase
  .from('items')
  .select('id, name, usage_count')
  .eq('type', 'merchandise')
  .eq('is_active', true)
  .order('usage_count', { ascending: false })
  .limit(10);
```

#### 5.2.3 Real-time Subscriptions

```typescript
// Subscribe to stock changes for alerts
const subscription = supabase
  .channel('stock-alerts')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'items',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      const item = payload.new;
      if (item.stock_quantity <= item.critical_threshold) {
        showToast(`CRITICAL: ${item.name} stock is ${item.stock_quantity}`);
      } else if (item.stock_quantity <= item.low_threshold) {
        showToast(`LOW: ${item.name} stock is ${item.stock_quantity}`);
      }
    }
  )
  .subscribe();
```

### 5.3 External System Interfaces

**No external system integrations** per SRS.md Section 2.3 constraints:
- No payment gateway integration
- No fiscal system integration
- No CRM integration

The system is intentionally self-contained.

---

## 6. Security Design

### 6.1 Authentication Design (RNF05)

#### 6.1.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                              │
│                                                                     │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐ │
│   │  Login   │────▶│ Supabase │────▶│  JWT     │────▶│ Session  │ │
│   │  Form    │     │  Auth    │     │  Token   │     │  Store   │ │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘ │
│        │                                                  │        │
│        │                                                  │        │
│   Email/Password                                     localStorage  │
│                                                                     │
│   Session Expiry: 24 hours (configurable in Supabase)             │
│   Auto-refresh: Enabled (before expiry)                           │
│   Persistence: localStorage                                        │
└─────────────────────────────────────────────────────────────────────┘
```

#### 6.1.2 Route Protection

```typescript
// src/routes/_authenticated.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw redirect({
        to: "/auth/signin",
        search: { redirect: location.href },
      });
    }

    // Provide session to child routes
    return { session };
  },
});
```

#### 6.1.3 Password Requirements

| Requirement | Value | Rationale |
|-------------|-------|-----------|
| Minimum length | 6 characters | Supabase default, sufficient for single-user system |
| Complexity | None required | Balance between security and usability for target users |

### 6.2 Authorization Design

#### 6.2.1 Row Level Security (RLS)

All database tables implement RLS policies ensuring:
- Users can only access their own data
- Queries automatically filtered by `auth.uid()`
- No need for application-level authorization checks

```sql
-- Example RLS policy pattern
CREATE POLICY "Users can manage own items"
  ON public.items FOR ALL
  USING (auth.uid() = user_id);
```

#### 6.2.2 Single-User Model

Per SRS.md, the system is designed for single-user operation (solo entrepreneur). Therefore:
- No role-based access control needed
- No multi-tenancy beyond RLS
- No team/organization hierarchy

### 6.3 Data Protection

| Data Type | Protection Method |
|-----------|------------------|
| Credentials | Supabase handles hashing (bcrypt) |
| Session tokens | JWT with short expiry, stored in localStorage |
| Business data | RLS prevents cross-user access |
| API keys | Environment variables, never committed |

### 6.4 Security Considerations

**Client-Side Vulnerabilities:**
- XSS: React's automatic escaping + `escapeValue: false` disabled only for i18n interpolation
- CSRF: Not applicable (no cookies for auth, JWT-based)
- localStorage tampering: Session validation server-side via Supabase

**API Security:**
- Supabase anon key is public (designed for client-side use)
- RLS provides actual data protection
- Rate limiting handled by Supabase

---

## 7. Performance Design

### 7.1 Performance Requirements (RNF04)

| Operation | Target | Guaranteed Volume |
|-----------|--------|-------------------|
| Add item to comanda | <= 200ms | 30 items, 100 comandas |
| Search items | <= 200ms | 30 items |
| Initial item list load | <= 500ms | 30 items |
| Close comanda | <= 300ms | - |
| Generate report | <= 1000ms | - |

### 7.2 Optimization Strategies

#### 7.2.1 Code Splitting

TanStack Router with `autoCodeSplitting: true` ensures:
- Each route loads only when navigated to
- Smaller initial bundle size
- Faster time-to-interactive

```typescript
// vite.config.ts
tanstackRouter({ target: "react", autoCodeSplitting: true })
```

#### 7.2.2 Database Indexing

Strategic indexes for common queries:
```sql
CREATE INDEX idx_items_user_active ON items(user_id, is_active);
CREATE INDEX idx_comandas_user_status ON comandas(user_id, status);
CREATE INDEX idx_comandas_user_date ON comandas(user_id, created_at DESC);
```

#### 7.2.3 Client-Side Caching

**Supabase Real-time for Cache Invalidation:**
```typescript
// Items remain in React state, updates pushed via subscription
const [items, setItems] = useState<Item[]>([]);

useEffect(() => {
  // Initial fetch
  fetchItems().then(setItems);

  // Subscribe to changes
  const subscription = supabase
    .channel('items-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'items'
    }, handleItemChange)
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

#### 7.2.4 Debounced Search

```typescript
// Prevent excessive queries during typing
const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    setSearchResults(filterItems(items, query));
  },
  150 // 150ms debounce
);
```

### 7.3 Scalability Considerations (RNF06)

**Target Performance Envelope:**
- Up to 100 items: Full performance guaranteed
- Up to 100 open comandas: Full performance guaranteed
- Beyond limits: Graceful degradation, functionality preserved

**Scaling Strategies (if needed):**
- Virtual scrolling for large lists
- Pagination for historical data
- Archive old comandas (> 1 year)

---

## 8. Error Handling and Logging

### 8.1 Error Handling Strategy

#### 8.1.1 Error Categories

| Category | Handling | User Feedback |
|----------|----------|---------------|
| **Validation** | Client-side prevention | Inline field errors |
| **Network** | Retry with backoff, offline queue | Toast notification |
| **Authentication** | Redirect to login | Error page |
| **Database** | Log, show generic message | Toast with retry option |
| **Unexpected** | Log full details, show generic | Error boundary fallback |

#### 8.1.2 Error Message Mapping

**File:** `src/lib/auth-utils.ts`

```typescript
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case "Invalid login credentials":
        return i18n.t("errors:auth.invalidCredentials");
      case "Email not confirmed":
        return i18n.t("errors:auth.emailNotConfirmed");
      case "User already registered":
        return i18n.t("errors:auth.userAlreadyExists");
      default:
        return error.message;
    }
  }
  return i18n.t("errors:auth.unexpectedError");
}
```

#### 8.1.3 Form Validation Pattern

```typescript
// Validators return error message or null
export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return i18n.t("errors:validation.passwordTooShort");
  }
  return null;
}

// Usage in component
const [passwordError, setPasswordError] = useState<string | null>(null);

const handleSubmit = () => {
  const error = validatePassword(password);
  if (error) {
    setPasswordError(error);
    return;
  }
  // Proceed with submission
};
```

### 8.2 Logging Design

#### 8.2.1 Client-Side Logging

**Development:**
- Console logging for debugging
- React DevTools integration
- TanStack Router devtools

**Production:**
- Minimal console output
- Consider future integration with error tracking (Sentry, etc.)

#### 8.2.2 Audit Trail

Business-critical operations logged in database:
- Stock movements (all types)
- Price changes (price_history table)
- Comanda status changes (timestamps in comandas table)

### 8.3 Offline Error Handling (RNF03)

```typescript
// Detect offline state
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Show offline indicator
{!isOnline && (
  <Banner variant="warning">
    {t('common:offlineMode')}
  </Banner>
)}
```

---

## 9. Traceability Matrix

### 9.1 Requirements to Design Elements

| Requirement | Design Elements |
|-------------|-----------------|
| **RF01** Gestao de Comandas | `comandas` table, `comanda-form.tsx`, `comandas/` routes |
| **RF02** Lancamento de Itens | `comanda_items` table, `item-selector.tsx`, `comanda-form.tsx` |
| **RF03** Fechamento e Pagamento | `payments` table, `payment-form.tsx`, `close_comanda()` function |
| **RF04** Classificacao de Itens | `items.type` enum (merchandise/supply), `item-form.tsx` |
| **RF05** Baixa Automatica | `close_comanda()` function, `stock_movements` table |
| **RF06** Ajuste Manual de Estoque | `stock_movements` table, `stock-adjustment.tsx` |
| **RF07** Monitoramento Visual | `v_low_stock_items` view, `stock-badge.tsx`, threshold fields |
| **RF08** Geracao de Relatorios | `v_daily_sales` view, `relatorios/` routes, `export-buttons.tsx` |
| **RF09** Alertas de Reposicao | Real-time subscription, `alert-banner.tsx`, push notifications |
| **RF10** Busca e Filtro de Itens | `categories` table, `item-selector.tsx` (search, filter, sort) |
| **RF11** Gestao de Precos | `price_history` table, price trigger |
| **RF12** Cancelamento de Comandas | `cancel_comanda()` function, `comanda_actions.tsx` |
| **RF13** Pagamentos Multiplos | `payments` table (1:N), `payment-form.tsx` |
| **RNF01** Usabilidade Mobile | Mobile-first CSS, 48px touch targets, touch counts |
| **RNF02** Portabilidade | PWA manifest, responsive design, browser support |
| **RNF03** Persistencia e Offline | IndexedDB, localStorage, `use-offline-sync.ts` |
| **RNF04** Desempenho | Indexes, code splitting, debouncing, virtual scroll |
| **RNF05** Seguranca e Autenticacao | Supabase Auth, RLS, `_authenticated` layout |
| **RNF06** Escalabilidade | Pagination, archiving strategy, graceful degradation |
| **RNF07** Integridade e Backup | Export/import JSON, `BackupData` interface |

### 9.2 Component to Requirements

| Component | Addresses |
|-----------|-----------|
| `_authenticated.tsx` | RNF05 |
| `item-selector.tsx` | RF02, RF10 |
| `payment-form.tsx` | RF03, RF13 |
| `stock-badge.tsx` | RF07 |
| `alert-banner.tsx` | RF09 |
| `comanda-form.tsx` | RF01, RF02 |
| `stock-adjustment.tsx` | RF06 |
| `date-range-picker.tsx` | RF08 |
| `export-buttons.tsx` | RF08, RNF07 |
| `use-offline-sync.ts` | RNF03 |

### 9.3 Database Tables to Requirements

| Table | Addresses |
|-------|-----------|
| `user_profiles` | RNF05 |
| `categories` | RF10 |
| `items` | RF04, RF07, RF10, RF11 |
| `price_history` | RF11 |
| `stock_movements` | RF05, RF06, RF12 |
| `comandas` | RF01, RF12 |
| `comanda_items` | RF02, RF11 |
| `payments` | RF03, RF13 |

---

## Appendix A: i18n Namespace Organization

| Namespace | Content |
|-----------|---------|
| `common` | Shared UI elements (buttons, labels, navigation) |
| `auth` | Authentication screens (signin, signup) |
| `dashboard` | Main dashboard content |
| `comandas` | Order management screens |
| `estoque` | Inventory management screens |
| `relatorios` | Reporting screens |
| `errors` | Error messages (validation, API, auth) |
| `landing` | Public landing page |

---

## Appendix B: Environment Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `eyJ...` |
| `VITE_BASE_PATH` | Deployment base path | `/gestao-solo/` |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Claude Opus 4.5 | Initial release |

---

*This document was generated following IEEE 1016-2009 standards for Software Design Descriptions.*
