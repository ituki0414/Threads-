# Scheduled Posts Analysis - Complete Report

## Overview

This directory contains a comprehensive analysis of the **Scheduled Posts feature** in ThreadStep. The feature is **BROKEN** - scheduled posts are never automatically published at their scheduled time.

## Documents Included

### 1. **SCHEDULED_POSTS_SUMMARY.txt** ⭐ START HERE
**Quick Overview (8.8 KB)**
- Key findings at a glance
- Severity assessment
- Architecture overview
- Code references
- What needs to be fixed
- Implementation roadmap

**Best for:** Getting the big picture quickly

---

### 2. **SCHEDULED_POSTS_ANALYSIS.md** 📋 DETAILED REFERENCE
**Complete Technical Analysis (13 KB)**
- End-to-end feature walkthrough
- Composer page creation logic
- Database schema details
- API endpoints documentation
- Missing components analysis
- Issues with current implementation
- Recommended solutions with code examples

**Best for:** Understanding the technical details and implementing fixes

---

### 3. **SCHEDULED_POSTS_QUICK_REFERENCE.md** 🚀 DEVELOPER GUIDE
**Quick Reference & Code Examples (7.4 KB)**
- Current architecture diagram
- Timeline comparison (expected vs actual)
- The critical gap visualization
- Code snippets for what's missing
- Issues summary table
- Fix implementation examples

**Best for:** Developers implementing the fix

---

### 4. **SCHEDULED_POSTS_ISSUE_DIAGRAM.txt** 📊 VISUAL GUIDE
**Visual Flowcharts & Diagrams (8.2 KB)**
- Data flow diagrams
- Expected vs actual behavior
- Root cause analysis
- File locations and roles
- Fix checklist

**Best for:** Visual learners and project managers

---

## Quick Summary

### The Problem
```
Users schedule posts to publish at specific times (e.g., 15:00 JST)
→ Posts are stored in database with state='scheduled'
→ NO automatic publisher checks if posts should be published
→ Posts sit in 'scheduled' state indefinitely
→ Users must manually click "Publish Now" to publish
→ When manually published, timestamp is set to NOW() (not scheduled_at)
```

### What's Broken
- ❌ **NO Cron Job**: `/app/api/cron/publish-scheduled/route.ts` does NOT exist
- ❌ **NO Background Worker**: No mechanism to execute at scheduled time
- ❌ **Wrong Timestamps**: published_at = NOW() instead of scheduled_at
- ❌ **NO Notifications**: Users don't know when posts are ready
- ❌ **NO Polling**: Calendar doesn't check for overdue posts

### What Works
- ✅ Composer page (create posts with date/time)
- ✅ Media upload
- ✅ API endpoints (store in database)
- ✅ Database schema (has scheduled_at column)
- ✅ Calendar UI (displays scheduled posts)
- ✅ Manual "Publish Now" button

### Severity
🔴 **CRITICAL** - Feature is unusable as advertised

### Fix Time
2-4 hours for basic implementation

---

## Key Files Referenced

### Existing (Working)
| File | Lines | Purpose |
|------|-------|---------|
| `/app/composer/page.tsx` | 166-260 | Create scheduled posts |
| `/app/api/posts/route.ts` | 44-140 | Store posts API |
| `/app/api/posts/thread/route.ts` | 100-130 | Store threads API |
| `/supabase/schema.sql` | 15-27 | Database schema |
| `/app/calendar/page.tsx` | 252-280 | Manual publish handler |

### Missing (Broken)
| File | Purpose |
|------|---------|
| `/app/api/cron/publish-scheduled/route.ts` | **DOES NOT EXIST** - Auto publisher |
| `/next.config.js` (crons section) | **NOT CONFIGURED** - Cron setup |

---

## What Needs to Be Done

### Priority 1 (CRITICAL)
```
Create: /app/api/cron/publish-scheduled/route.ts

This endpoint should:
1. Query database: SELECT * FROM posts WHERE state='scheduled' AND scheduled_at <= NOW()
2. For each post:
   - Call Threads API createPost()
   - Update post: state='published', published_at=scheduled_at, threads_post_id=...
3. Run every 5 minutes via cron

Configure: Add to next.config.js:
crons: [
  { path: '/api/cron/publish-scheduled', schedule: '*/5 * * * *' }
]
```

### Priority 2 (HIGH)
- Change `published_at: new Date().toISOString()` to `published_at: post.scheduled_at`
- Add notifications/reminders when scheduled time arrives

### Priority 3 (MEDIUM)
- Visual indicators for overdue posts in calendar
- Batch publishing optimization
- Error handling and retry logic

---

## How to Use These Documents

1. **First Time?** → Read `SCHEDULED_POSTS_SUMMARY.txt`
2. **Need Details?** → Read `SCHEDULED_POSTS_ANALYSIS.md`
3. **Implementing Fix?** → Use `SCHEDULED_POSTS_QUICK_REFERENCE.md`
4. **Visual Learner?** → Check `SCHEDULED_POSTS_ISSUE_DIAGRAM.txt`

---

## Document Map

```
README_SCHEDULED_POSTS_ANALYSIS.md (This file)
├── SCHEDULED_POSTS_SUMMARY.txt ..................... Overview & Status
├── SCHEDULED_POSTS_ANALYSIS.md ..................... Technical Deep-Dive
├── SCHEDULED_POSTS_QUICK_REFERENCE.md ............. Developer Guide
└── SCHEDULED_POSTS_ISSUE_DIAGRAM.txt .............. Visual Diagrams
```

---

## Analysis Metadata

- **Analysis Date**: 2024-11-11
- **Codebase Version**: Latest (Nov 11)
- **Status**: BROKEN - Critical Issue
- **Estimated Fix Time**: 2-4 hours
- **Impact**: HIGH - Core feature non-functional

---

## Questions?

Refer to the specific document sections:

- "How do I create a scheduled post?" → SCHEDULED_POSTS_SUMMARY.txt - Architecture
- "What's the exact problem?" → SCHEDULED_POSTS_ANALYSIS.md - Issue #1
- "How do I fix this?" → SCHEDULED_POSTS_QUICK_REFERENCE.md - How to Fix
- "Show me the flow?" → SCHEDULED_POSTS_ISSUE_DIAGRAM.txt - Data Flow

---

Generated with detailed analysis of the ThreadStep codebase.
All line numbers and file paths verified as of 2024-11-11.
