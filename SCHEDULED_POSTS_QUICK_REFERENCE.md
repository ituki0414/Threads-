# Scheduled Posts - Quick Reference Guide

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMPOSER PAGE                             │
│              (/app/composer/page.tsx)                            │
│                                                                   │
│  User Input (Date/Time/Media) → API Call to /api/posts          │
│  └─ Lines 166-260: handleSchedule()                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │ POST request with publish_now=false
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT                                   │
│          /api/posts or /api/posts/thread                         │
│                                                                   │
│  - Receives scheduled_at timestamp                              │
│  - Creates post with state='scheduled'                          │
│  - Sets threads_post_id = NULL                                  │
│  - Sets published_at = NULL                                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │ INSERT into posts table
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│               SUPABASE DATABASE                                   │
│          posts table (with scheduled_at index)                   │
│                                                                   │
│  Status: ✅ Stores scheduled posts correctly                    │
│  Problem: ❌ NO AUTOMATIC PUBLISHING LOGIC                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ├─── ✅ Synced to Calendar UI
                   │
                   └─── ❌ Posts stay "scheduled" forever!
                        ❌ No cron job checks scheduled_at
                        ❌ No background worker publishes posts
                        ❌ Only manual "Publish Now" works
```

## Timeline: What Should Happen vs What Actually Happens

### CORRECT FLOW (What should happen)
```
T-0h00m → User schedules post for 15:00 JST
          POST /api/posts (scheduled_at: 2024-11-15T15:00:00+09:00)
          ✅ Post saved with state='scheduled'

T+15h00m → Scheduled time arrives
          ❌ BROKEN: Nothing happens automatically!
          
T+15h05m → Cron job runs (if it existed)
          → Queries: SELECT * FROM posts WHERE state='scheduled' AND scheduled_at <= NOW()
          → Finds the post
          → Calls Threads API: createPost()
          → Updates post: state='published', published_at=scheduled_at, threads_post_id=...
          ✅ Post published on time
```

### ACTUAL FLOW (What really happens)
```
T-0h00m → User schedules post for 15:00 JST
          POST /api/posts (scheduled_at: 2024-11-15T15:00:00+09:00)
          ✅ Post saved with state='scheduled'

T+15h00m → Scheduled time arrives
          ❌ Nothing happens
          ❌ Post still state='scheduled'
          ❌ No notification to user

T+15h05m → User happens to visit Calendar page
          → Sees post in calendar
          → Has to manually click "Publish Now" button
          → Post finally published with published_at=NOW() (not scheduled_at)
          ⚠️ Wrong publication time recorded!

T+1000h00m → User forgets to publish
             ❌ Post never gets published
```

## The Critical Gap

```
SCHEDULED_AT TABLE       ACTUAL PUBLISHING
─────────────────       ─────────────────
2024-11-15 09:00 ────┐
2024-11-15 12:00     │  ❌ NOTHING HAPPENS HERE!
2024-11-15 15:00     ├─ User has to manually publish
2024-11-15 18:00     │  via calendar UI
2024-11-15 21:00 ────┘
```

## What's Missing (The Gap)

### MISSING: Automatic Publisher
```typescript
// This endpoint DOES NOT EXIST:
// GET /api/cron/publish-scheduled

// Should do:
async function publishScheduledPosts() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'scheduled')
    .lte('scheduled_at', new Date().toISOString());
    
  for (const post of posts) {
    // Get access token for account
    // Call Threads API createPost()
    // Update post: state='published', published_at=scheduled_at
  }
}
```

### WHAT EXISTS: Manual Publisher
```typescript
// This DOES exist and works:
const handlePublishPost = async (postId: string) => {
  await supabase.from('posts').update({
    state: 'published',
    published_at: new Date().toISOString()  // ⚠️ Wrong! Uses NOW(), not scheduled_at
  }).eq('id', postId);
};
```

## Issues Summary

| Issue | Severity | Impact |
|-------|----------|--------|
| No automatic publishing at scheduled_at | 🔴 CRITICAL | Posts never publish on time |
| published_at set to NOW() not scheduled_at | 🟡 HIGH | Wrong timestamps in analytics |
| No reminder/notification system | 🟡 HIGH | Users might forget to publish |
| Calendar sync only checks published posts | 🟡 MEDIUM | Doesn't check overdue scheduled posts |

## How to Fix

### Fastest Solution: Add Cron Endpoint
```typescript
// File: /app/api/cron/publish-scheduled/route.ts
export async function GET() {
  const { data: overduePostsScheduled } = await supabaseAdmin
    .from('posts')
    .select('*, accounts(access_token)')
    .eq('state', 'scheduled')
    .lte('scheduled_at', new Date().toISOString());
    
  for (const post of overduePostsScheduled) {
    const threadsClient = new ThreadsAPIClient(post.accounts.access_token);
    const result = await threadsClient.createPost({
      text: post.caption,
      mediaUrl: post.media[0],
    });
    
    await supabaseAdmin
      .from('posts')
      .update({
        state: 'published',
        published_at: post.scheduled_at,  // Use scheduled_at!
        threads_post_id: result.id
      })
      .eq('id', post.id);
  }
}
```

Then add to `next.config.js`:
```javascript
crons: [
  { path: '/api/cron/publish-scheduled', schedule: '*/5 * * * *' }
]
```

## File Locations

| Component | File | Status |
|-----------|------|--------|
| Composer (Creation) | `/app/composer/page.tsx` | ✅ Works |
| Calendar (UI) | `/app/calendar/page.tsx` | ✅ Works |
| API (Storage) | `/app/api/posts/route.ts` | ✅ Works |
| Database (Schema) | `/supabase/schema.sql` | ✅ Works |
| **Scheduler (Publishing)** | **MISSING** | **❌ BROKEN** |
| **Cron Job** | **MISSING** | **❌ BROKEN** |

