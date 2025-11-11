# ThreadStep Scheduled Posts Feature - Complete Analysis

## Executive Summary

The scheduled posts feature in ThreadStep is **PARTIALLY FUNCTIONAL but NOT FULLY AUTOMATED**. While users can create, store, and manually publish scheduled posts, there is **NO automatic publication mechanism** to publish posts at their scheduled time.

### Critical Issue
**Scheduled posts are NOT automatically published at their scheduled_at time.** Users must manually visit the calendar and click "Now Publish" button to publish scheduled posts, even after the scheduled time has passed.

---

## 1. How Scheduled Posts Are Created (Composer Page)

### Location
- **File**: `/Users/itsukiokamoto/threadstep/app/composer/page.tsx`
- **Lines**: 166-260 (handleSchedule function)

### Flow
```
User Input → Date/Time Picker → Upload Media → API Call → Database Storage
```

### Details

#### A. User Interface (Composer Page)
- **Date Input**: Japanese Standard Time (JST/Asia/Tokyo)
  - Lines 27-59: `getJSTDateString()` and `getJSTTimeString()` functions handle JST conversion
  - Lines 53-58: Separate date (YYYY-MM-DD) and time (HH:MM) inputs
  
- **Scheduling Parameters**:
  ```typescript
  const [scheduleDate, setScheduleDate] = useState(...); // YYYY-MM-DD
  const [scheduleTime, setScheduleTime] = useState(...); // HH:MM
  const [scheduledDate, setScheduledDate] = useState(...); // Full Date object
  ```

- **Time Conversion Logic** (Lines 113-120):
  ```typescript
  const jstDateTimeString = `${date}T${time}:00+09:00`;
  const combined = new Date(jstDateTimeString);
  setScheduledDate(combined); // Stored as ISO string
  ```

#### B. Media Upload
- **Single Posts** (Lines 132-164): Media uploaded via `/api/media/upload`
- **Thread Posts** (Lines 179-200): Multiple posts with media
- **Maximum**: 10 files per post, 100MB per file

#### C. API Call to Save Scheduled Post
**Single Post** (Lines 233-244):
```typescript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    caption,
    media: mediaUrls,
    scheduled_at: scheduledDate.toISOString(),
    publish_now: false,                    // KEY: Set to false for scheduling
    account_id: accountId,
  }),
});
```

**Thread Post** (Lines 208-217):
```typescript
const response = await fetch('/api/posts/thread', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    posts: threadData,
    scheduled_at: scheduledDate.toISOString(),
    publish_now: false,                    // KEY: Set to false for scheduling
    account_id: accountId,
  }),
});
```

---

## 2. Database Schema for Scheduled Posts

### Location
- **File**: `/Users/itsukiokamoto/threadstep/supabase/schema.sql`
- **Table**: `posts`

### Schema Definition (Lines 15-27)
```sql
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  threads_post_id TEXT,
  state TEXT NOT NULL CHECK (state IN ('published', 'scheduled', 'draft', 'needs_approval', 'failed')),
  caption TEXT NOT NULL,
  media TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,  -- KEY FIELD: Stores scheduled publication time
  published_at TIMESTAMP WITH TIME ZONE,  -- NULL until actually published
  slot_quality TEXT CHECK (slot_quality IN ('best', 'normal', 'avoid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Index (Line 79)
```sql
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at) WHERE state = 'scheduled';
```

### Post States
1. **`'scheduled'`**: Waiting to be published (has scheduled_at time set)
2. **`'published'`**: Already published (has published_at time set)
3. **`'draft'`**: Not yet scheduled
4. **`'needs_approval'`**: Awaiting manual approval
5. **`'failed'`**: Failed to publish

### Sample Database Entry
```
{
  id: "uuid-123",
  account_id: "user-uuid",
  threads_post_id: NULL,                           // NULL until published
  state: "scheduled",                              // KEY: marked as scheduled
  caption: "投稿内容",
  media: ["https://example.com/image1.jpg"],
  scheduled_at: "2024-11-15T20:00:00+09:00",       // Scheduled time
  published_at: NULL,                              // NULL until published
  slot_quality: NULL,
  created_at: "2024-11-11T10:00:00+00:00",
  updated_at: "2024-11-11T10:00:00+00:00"
}
```

---

## 3. How Scheduled Posts Are Stored (API Endpoints)

### A. Single Post Endpoint
**File**: `/Users/itsukiokamoto/threadstep/app/api/posts/route.ts`

**POST /api/posts** (Lines 44-140)
```typescript
if (publish_now) {
  // Immediate publication logic (publish now)
} else {
  // Scheduled post storage (publish_now = false)
  const { data: post, error: insertError } = await supabaseAdmin
    .from('posts')
    .insert({
      account_id: accountId,
      threads_post_id: null,                    // NULL: not published yet
      state: 'scheduled',                       // Marked as scheduled
      caption,
      media,
      scheduled_at: scheduled_at || null,       // Scheduled time from request
      published_at: null,                       // NULL: not published yet
      slot_quality: null,
    })
    .select()
    .single();
}
```

### B. Thread Post Endpoint
**File**: `/Users/itsukiokamoto/threadstep/app/api/posts/thread/route.ts`

**POST /api/posts/thread** (Lines 100-130)
```typescript
if (publish_now) {
  // Immediate thread publication
} else {
  // Scheduled thread storage
  const savedPosts = await Promise.all(
    posts.map(async (post: any, index: number) => {
      const { data: savedPost, error: insertError } = await supabaseAdmin
        .from('posts')
        .insert({
          account_id: accountId,
          threads_post_id: null,                // NULL: not published yet
          state: 'scheduled',                   // Marked as scheduled
          caption: post.caption,
          media: post.media || [],
          scheduled_at: scheduled_at || null,   // Scheduled time
          published_at: null,                   // NULL: not published yet
          slot_quality: null,
        })
        .select()
        .single();
    })
  );
}
```

---

## 4. How Scheduled Posts Are Executed ⚠️ CRITICAL ISSUE

### THE PROBLEM: No Automatic Publishing Mechanism

**There is NO cron job, background worker, or scheduled task handler that automatically publishes posts at their `scheduled_at` time.**

### What Actually Happens

1. **Posts are stored** in the database with `state = 'scheduled'` and a `scheduled_at` time
2. **Users see them** on the Calendar page
3. **That's it** - no automatic publishing!

### Manual Publishing Only

**File**: `/Users/itsukiokamoto/threadstep/app/calendar/page.tsx`
**Lines**: 252-280

```typescript
const handlePublishPost = async (postId: string) => {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        state: 'published',                            // Change from 'scheduled' to 'published'
        published_at: new Date().toISOString(),         // Set publish time NOW (not scheduled_at!)
      })
      .eq('id', postId);
    
    // ...UI updates...
  }
};
```

### User Flow Currently
1. Composer: User creates scheduled post for "2024-11-15 20:00"
2. Database: Post stored with `state='scheduled'`, `scheduled_at='2024-11-15T20:00:00+09:00'`
3. Calendar: Post appears in calendar
4. **2024-11-15 20:00 arrives**: Nothing happens automatically ❌
5. User manually visits Calendar and clicks "Now Publish" button
6. Post is published with current time as `published_at` (NOT the scheduled_at time!)

### PostModal Component
**File**: `/Users/itsukiokamoto/threadstep/components/PostModal.tsx`
**Lines**: 347-351

```typescript
{post.state === 'scheduled' && (
  <Button onClick={handlePublishNow}>
    <Send className="w-4 h-4 mr-2" />
    今すぐ公開 {/* "Publish Now" button */}
  </Button>
)}
```

---

## 5. Missing Components

### A. No Cron Job
- ❌ No `/api/cron/*` routes
- ❌ No scheduled task handler
- ❌ No background worker

### B. No Polling Mechanism
- ✓ Calendar page polls posts every 5 minutes (Lines 179-181)
  ```typescript
  const syncInterval = setInterval(() => {
    syncPosts();
  }, 5 * 60 * 1000); // Every 5 minutes
  ```
- ❌ But `syncPosts()` only syncs from Threads API (already published posts)
- ❌ Doesn't check for `scheduled_at` posts that need publishing

### C. No Server-Side Execution
- No Supabase Edge Function
- No Vercel Cron (Next.js doesn't support cron in standard deployment)
- No background job queue (no Bull, BullMQ, or similar)

---

## Issues with the Current Implementation

### Issue #1: Scheduled Posts Never Auto-Publish
**Severity**: 🔴 CRITICAL
- Posts with past `scheduled_at` times remain in `'scheduled'` state indefinitely
- Users might forget to manually publish posts
- No notifications or reminders

### Issue #2: Wrong Publication Time
**Severity**: 🟡 HIGH
- When user clicks "Publish Now", post gets `published_at = NOW()`
- Not the original `scheduled_at` time
- Analytics and reporting will show wrong publication times

### Issue #3: No Notification System
**Severity**: 🟡 HIGH
- Users don't know when their scheduled post is ready to be published
- No reminder at scheduled time

### Issue #4: Calendar Page Doesn't Check Scheduled Posts
**Severity**: 🟡 MEDIUM
- Calendar only syncs already-published posts from Threads API
- Doesn't check if scheduled posts need publishing
- UI shows scheduled posts, but no visual indicator they're overdue

---

## What Needs to Be Fixed

### Option 1: Add Cron Job (Recommended)
**Implementation**:
```
1. Create `/api/cron/publish-scheduled` endpoint
2. Add to `next.config.js`: 
   ```
   crons: [
     { path: '/api/cron/publish-scheduled', schedule: '*/5 * * * *' } // Every 5 min
   ]
   ```
3. Endpoint logic:
   - Find all posts where:
     * state = 'scheduled'
     * scheduled_at <= NOW()
   - For each post:
     * Get account's access_token
     * Call Threads API to publish
     * Update post: state='published', published_at=scheduled_at
     * Update threads_post_id with response from Threads API
```

### Option 2: Add Supabase Edge Function
**Implementation**:
```
1. Create Edge Function that:
   - Queries posts where state='scheduled' AND scheduled_at <= NOW()
   - Publishes via Threads API
   - Updates database
2. Trigger via Supabase schedules (if available)
3. Or expose as webhook and call from external cron service
```

### Option 3: Client-Side Polling (Not Recommended)
```
- Calendar page already polls every 5 minutes
- Could add logic to check scheduled_at times
- Issues: Only works when page is open, not reliable
```

---

## Summary Table

| Component | Status | Details |
|-----------|--------|---------|
| **Composer Page** | ✅ Working | Creates scheduled posts with date/time |
| **Media Upload** | ✅ Working | Uploads via `/api/media/upload` |
| **API Endpoints** | ✅ Working | POST `/api/posts` and `/api/posts/thread` |
| **Database Schema** | ✅ Working | `posts` table with `scheduled_at` column |
| **Database Indices** | ✅ Working | Index on `scheduled_at` for quick queries |
| **Calendar UI** | ✅ Working | Shows scheduled posts in calendar view |
| **Manual Publishing** | ✅ Working | "Publish Now" button works |
| **Automatic Publishing** | ❌ BROKEN | No cron job or background worker |
| **Scheduled Execution** | ❌ BROKEN | No mechanism to auto-publish at `scheduled_at` |
| **Post History Accuracy** | ⚠️ PARTIAL | `published_at` is set to NOW(), not `scheduled_at` |

---

## File References

### Core Files
1. **Composer Page**: `/Users/itsukiokamoto/threadstep/app/composer/page.tsx` (1043 lines)
2. **Calendar Page**: `/Users/itsukiokamoto/threadstep/app/calendar/page.tsx` (494 lines)
3. **API Endpoint**: `/Users/itsukiokamoto/threadstep/app/api/posts/route.ts` (141 lines)
4. **Thread Endpoint**: `/Users/itsukiokamoto/threadstep/app/api/posts/thread/route.ts` (139 lines)
5. **Database Schema**: `/Users/itsukiokamoto/threadstep/supabase/schema.sql` (133 lines)
6. **PostModal Component**: `/Users/itsukiokamoto/threadstep/components/PostModal.tsx` (360 lines)

### Missing Files
- ❌ `/app/api/cron/publish-scheduled/route.ts` (DOES NOT EXIST)
- ❌ Any background job handler
- ❌ Any scheduled task configuration

---

## Recommendations

### Priority 1 (MUST FIX)
Implement automatic scheduled post publishing via:
- Next.js cron routes (if using Vercel)
- External cron service (e.g., EasyCron, cron-job.org)
- Supabase Edge Function with scheduled trigger

### Priority 2 (SHOULD FIX)
- Use `scheduled_at` instead of NOW() when publishing
- Add visual indicator for overdue scheduled posts
- Add notification/reminder system

### Priority 3 (NICE TO HAVE)
- Batch publishing if multiple posts are scheduled
- Error handling and retry logic
- Logging for debugging

