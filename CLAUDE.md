# CLAUDE.md - ThreadStep AI Assistant Guide

## Project Overview

**ThreadStep** (スレぽす) is a Threads social media management platform designed to streamline content creation, scheduling, engagement automation, and analytics for Threads creators. It provides a Buffer-like interface for managing Threads posts with advanced auto-reply capabilities.

**Key Features:**
- Post scheduling with calendar visualization (week/month views)
- Auto-reply automation with multi-trigger support
- Engagement tracking and analytics
- Template management for content creation
- Multi-account support
- BAN avoidance rate limiting

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.33 |
| Language | TypeScript | 5.7.3 |
| Frontend | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.18 |
| UI Library | Shadcn/Radix UI | Latest |
| Icons | Lucide React | 0.469.0 |
| Animations | Framer Motion | 11.15.0 |
| State | Zustand | 5.0.2 |
| Database | Supabase (PostgreSQL) | 2.77.0 |
| External API | Threads Graph API | v1.0 |

## Directory Structure

```
/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── auth/                 # OAuth (login, callback)
│   │   ├── auto-reply/           # Auto-reply processing
│   │   ├── cron/                 # Scheduled job endpoints
│   │   ├── debug/                # Debug utilities
│   │   ├── media/                # Media upload
│   │   ├── posts/                # Post CRUD & sync
│   │   ├── profile/              # User profile
│   │   └── webhooks/             # Threads webhook handler
│   ├── dashboard/                # Home page
│   ├── calendar/                 # Calendar scheduling
│   ├── composer/                 # Post creation
│   ├── auto-reply/               # Auto-reply rules
│   ├── inbox/                    # DM/comment inbox
│   ├── analytics/                # Analytics dashboard
│   ├── settings/                 # Configuration
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── calendar/                 # Calendar (MonthView, WeekView, PostCard)
│   ├── ui/                       # Shadcn primitives
│   ├── layout/                   # Layout components
│   └── [modals]                  # Modal components
├── lib/                          # Shared utilities
│   ├── types/                    # TypeScript types
│   ├── constants.ts              # App constants
│   ├── datetime-utils.ts         # Date/time helpers
│   ├── helpers.ts                # Generic utilities
│   ├── supabase.ts               # Supabase public client
│   ├── supabase-admin.ts         # Supabase admin client
│   ├── threads-api.ts            # Threads API client
│   └── utils.ts                  # Tailwind utilities
└── [config files]                # package.json, tsconfig.json, etc.
```

## Development Workflow

### Starting Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:3000
```

### Building for Production
```bash
npm run build        # Compile for production
npm run start        # Run production server
npm run lint         # Run ESLint
```

### Environment Variables Required
```env
# Threads API
THREADS_APP_ID=<app_id>
THREADS_APP_SECRET=<app_secret>
NEXT_PUBLIC_THREADS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## Code Conventions

### File Organization
- **Pages**: `app/[page]/page.tsx` - Each page is a React component
- **API Routes**: `app/api/[endpoint]/route.ts` - Next.js API handlers
- **Components**: `components/[name].tsx` - Reusable React components
- **Types**: `lib/types/index.ts` - Core TypeScript interfaces
- **Utilities**: `lib/*.ts` - Shared helper functions

### TypeScript Patterns
```typescript
// Use explicit return types for API functions
export async function GET(request: Request): Promise<Response>

// Use interfaces for data models
interface Post {
  id: string;
  account_id: string;
  state: 'published' | 'scheduled' | 'draft' | 'needs_approval' | 'failed';
  caption: string;
  // ...
}

// Use type guards
function isNonEmptyString(value: unknown): value is string
```

### Styling Conventions
- Use Tailwind CSS utility classes
- Use CSS variables for theming (defined in `globals.css`)
- Follow the design tokens in `lib/design-tokens.ts`
- Use `cn()` utility for conditional classes

### Component Patterns
```tsx
// Use functional components with explicit prop types
interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  // Component implementation
}
```

## Database Schema

### Core Tables

**accounts** - User accounts connected via Threads OAuth
- `id`: UUID (primary key)
- `threads_user_id`: string
- `threads_username`: string
- `access_token`: string (encrypted)
- `token_expires_at`: timestamp

**posts** - Scheduled and published posts
- `id`: UUID
- `account_id`: UUID (FK -> accounts)
- `threads_post_id`: string | null
- `state`: 'published' | 'scheduled' | 'draft' | 'needs_approval' | 'failed'
- `caption`: text
- `media`: text[] (URLs)
- `scheduled_at`: timestamp | null
- `published_at`: timestamp | null
- `permalink`: string | null
- `metrics`: JSONB { likes, comments, saves }
- `retry_count`: integer
- `error_message`: text | null

**auto_reply_rules** - Automation rules for replies
- `id`: UUID
- `account_id`: UUID
- `name`: string
- `target_post_id`: UUID | null
- `trigger_reply`, `trigger_repost`, `trigger_quote`, `trigger_like`: boolean
- `keyword_condition`: 'all' | 'any' | 'none'
- `keywords`: text[]
- `timing_type`: 'immediate' | 'delayed' | 'like_threshold'
- `reply_text`: string
- `is_active`: boolean

**auto_replies** - Executed auto-reply records
- `id`: UUID
- `rule_id`: UUID (FK -> auto_reply_rules)
- `trigger_type`: 'reply' | 'repost' | 'quote' | 'like'
- `trigger_user_id`: string
- `reply_status`: 'pending' | 'waiting_likes' | 'sent' | 'failed'

## API Architecture

### Authentication Flow
1. User clicks login -> `/api/auth/login` redirects to Threads OAuth
2. Threads redirects back -> `/api/auth/callback` exchanges code for token
3. Token stored in `accounts` table
4. Session managed via `account_id` cookie

### Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/posts` | GET | List posts for account |
| `/api/posts` | POST | Create/schedule post |
| `/api/posts/sync` | GET | Sync posts from Threads |
| `/api/posts/sync-metrics` | GET | Update engagement metrics |
| `/api/auto-reply` | GET/POST | Manage auto-reply rules |
| `/api/auto-reply/v2/process` | POST | Process pending auto-replies |
| `/api/cron/publish-scheduled` | POST | Publish scheduled posts |

### Rate Limiting
- Standard API calls: 1 second delay
- Reply operations: 1.5 second delay
- Batch operations: chunked with delays

## Threads API Integration

### Client Usage (`lib/threads-api.ts`)
```typescript
import { ThreadsAPIClient } from '@/lib/threads-api';

const client = new ThreadsAPIClient(accessToken);
await client.getMe();                    // Get user profile
await client.getPosts();                 // Get user's posts
await client.publishPost(text, mediaUrl); // Publish new post
await client.publishReply(postId, text);  // Reply to post
await client.getPostInsights(postId);     // Get engagement metrics
```

### Important Limits
- Max posts per sync: 500
- Character limit: 500 per post
- Token expiration: 60 days
- Rate limits: Follow 1-1.5s delays between requests

## Common Tasks for AI Assistants

### Adding a New Page
1. Create `app/[page-name]/page.tsx`
2. Add navigation link in `components/Sidebar.tsx`
3. Follow existing page patterns for layout

### Adding a New API Endpoint
1. Create `app/api/[endpoint]/route.ts`
2. Export GET/POST/PUT/DELETE handlers
3. Use `supabase-admin.ts` for database operations
4. Handle authentication via `account_id` cookie

### Adding a New Component
1. Create `components/[ComponentName].tsx`
2. Define props interface
3. Use Tailwind for styling
4. Add to relevant pages

### Modifying Database Schema
1. Create SQL migration file at root
2. Run in Supabase SQL editor
3. Update types in `lib/types/index.ts`
4. Update relevant API routes

### Working with Auto-Reply System
- Rules defined in `auto_reply_rules` table
- Processing handled by `/api/auto-reply/v2/process`
- Supports: reply, repost, quote, like triggers
- Supports: keyword matching, hashtag filtering, date ranges

## Testing & Debugging

### Debug Scripts (Root Directory)
- `check-pending.ts` - Verify pending posts
- `check-calendar-data.ts` - Validate calendar data
- `debug-posts-dates.ts` - Debug date handling
- `test-threads-api-direct.ts` - Test Threads API

### Debug API Endpoints
- `/api/debug/accounts` - View account data
- `/api/debug/scheduled-posts` - View scheduled posts
- `/api/debug/auto-replies` - View auto-reply records
- `/api/debug/webhook-logs` - View webhook events

## Important Notes

### Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side
- Use `supabase.ts` for client-side, `supabase-admin.ts` for server-side
- Access tokens stored encrypted in database

### Timezone Handling
- Database stores UTC timestamps
- Frontend displays in user's local timezone (JST expected)
- Use `datetime-utils.ts` for conversions

### Error Handling
- Posts have `retry_count` and `error_message` for failure tracking
- Auto-replies have `reply_status` to track processing state
- API routes return structured JSON errors

### BAN Avoidance
- Rate limiting built into `threads-api.ts`
- Message diversification in auto-replies
- Configurable delays in settings

## Design System Reference

See `.claude/claude.md` for detailed design system documentation including:
- Color palette (Primary blue, Slate neutrals, Semantic colors)
- Typography scale
- Component styles (buttons, cards, inputs)
- Animation patterns
- Accessibility guidelines
