# Backend Implementation Plan: Supabase + Vercel Integration

**Goal**: Enable shared analytics and feedback storage across all users while maintaining localStorage as fallback.

**Timeline**: ~2-3 hours total implementation time

---

## Phase 1: Supabase Setup (30 min)

### Step 1.1: Create Supabase Project
- [ ] User goes to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Name: `proto-vocab-five-frameworks`
- [ ] Database Password: Generate strong password (save it!)
- [ ] Region: Choose closest to users (e.g., Mumbai for India)
- [ ] Wait for project to initialize (~2 minutes)

### Step 1.2: Create Database Tables
Execute SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analytics Events Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  device_fingerprint TEXT,
  framework TEXT NOT NULL,
  word_id TEXT NOT NULL,
  event TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  framework TEXT NOT NULL,
  word_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  step_label TEXT NOT NULL,
  thumb TEXT,
  include BOOLEAN,
  difficulty TEXT,
  comment TEXT,
  meta JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_framework ON analytics_events(framework);
CREATE INDEX idx_analytics_word ON analytics_events(word_id);
CREATE INDEX idx_analytics_event ON analytics_events(event);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

CREATE INDEX idx_feedback_framework ON feedback(framework);
CREATE INDEX idx_feedback_word ON feedback(word_id);
CREATE INDEX idx_feedback_step ON feedback(step_id);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - public prototype)
CREATE POLICY "Enable all operations for analytics_events"
  ON analytics_events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for feedback"
  ON feedback FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Step 1.3: Get API Credentials
- [ ] Go to Project Settings → API
- [ ] Copy `Project URL` (e.g., https://abc123.supabase.co)
- [ ] Copy `anon public` key (safe to use in frontend)
- [ ] Save both for next phase

---

## Phase 2: Local Development Setup (15 min)

### Step 2.1: Install Supabase Client
```bash
cd /Users/akashdatta/Desktop/proto-vocab-five-frameworks-28oct
npm install @supabase/supabase-js
```

### Step 2.2: Create Environment Variables
Create `.env.local` file:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Add to `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

### Step 2.3: Create Supabase Client
Create `/src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using localStorage only.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseEnabled = () => supabase !== null;
```

---

## Phase 3: Update Analytics Hook (30 min)

### Step 3.1: Add Device Tracking
Create `/src/lib/device.ts`:
```typescript
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  browserVersion: string;
  os: string;
  screenSize: string;
  language: string;
  timezone: string;
  isTouch: boolean;
  deviceFingerprint: string;
}

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
};

const generateFingerprint = (): string => {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() || '0',
    navigator.maxTouchPoints?.toString() || '0',
  ].join('|');

  return btoa(data).substring(0, 32);
};

export const getDeviceInfo = (): DeviceInfo => ({
  deviceType: getDeviceType(),
  browser: getBrowser(),
  browserVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown',
  os: getOS(),
  screenSize: `${screen.width}x${screen.height}`,
  language: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isTouch: navigator.maxTouchPoints > 0,
  deviceFingerprint: generateFingerprint(),
});
```

### Step 3.2: Update Session/User ID Generation
Create `/src/lib/session.ts`:
```typescript
const SESSION_ID_KEY = 'pvf_session_id';
const USER_ID_KEY = 'pvf_user_id';

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};
```

### Step 3.3: Create Analytics API Service
Create `/src/lib/analyticsApi.ts`:
```typescript
import { supabase, isSupabaseEnabled } from './supabase';
import type { AnalyticsEvent } from '../types';

export const saveAnalyticsEvent = async (event: AnalyticsEvent): Promise<void> => {
  if (!isSupabaseEnabled()) {
    console.log('Supabase disabled, using localStorage only');
    return;
  }

  try {
    const { error } = await supabase!
      .from('analytics_events')
      .insert({
        session_id: event.meta?.sessionId || crypto.randomUUID(),
        user_id: event.userId,
        device_fingerprint: event.meta?.deviceFingerprint,
        framework: event.framework,
        word_id: event.wordId,
        event: event.event,
        meta: event.meta || {},
      });

    if (error) {
      console.error('Failed to save analytics to Supabase:', error);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
  }
};

export const fetchAnalyticsEvents = async (): Promise<AnalyticsEvent[]> => {
  if (!isSupabaseEnabled()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform Supabase format to AnalyticsEvent format
    return (data || []).map(row => ({
      ts: new Date(row.created_at).getTime(),
      userId: row.user_id,
      framework: row.framework,
      wordId: row.word_id,
      event: row.event,
      meta: {
        ...row.meta,
        sessionId: row.session_id,
        deviceFingerprint: row.device_fingerprint,
      },
    }));
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return [];
  }
};
```

### Step 3.4: Update useAnalytics Hook
Modify `/src/hooks/useAnalytics.ts`:
```typescript
import { useCallback, useEffect, useState } from 'react';
import type { AnalyticsEvent } from '../types';
import { saveAnalyticsEvent, fetchAnalyticsEvents } from '../lib/analyticsApi';
import { getSessionId, getUserId } from '../lib/session';
import { getDeviceInfo } from '../lib/device';

const ANALYTICS_KEY = 'pvf_analytics_v1';

// Device info collected once per session
let deviceInfo: ReturnType<typeof getDeviceInfo> | null = null;
let sessionId: string | null = null;
let userId: string | null = null;

const initializeSession = () => {
  if (!sessionId) sessionId = getSessionId();
  if (!userId) userId = getUserId();
  if (!deviceInfo) deviceInfo = getDeviceInfo();
};

// ... keep existing loadEvents/saveEvents functions ...

export const useAnalytics = () => {
  const log = useCallback((event: Omit<AnalyticsEvent, 'ts' | 'userId'>) => {
    initializeSession();

    const analyticsEvent: AnalyticsEvent = {
      ...event,
      ts: Date.now(),
      userId: userId!,
      meta: {
        ...event.meta,
        sessionId,
        ...deviceInfo, // Add device info to every event
      },
    };

    // Save to localStorage (immediate)
    events.push(analyticsEvent);
    saveEvents(events);

    // Save to Supabase (background, non-blocking)
    saveAnalyticsEvent(analyticsEvent).catch(err => {
      console.error('Background analytics save failed:', err);
    });

    // Log to console in development
    if (import.meta.env && import.meta.env.DEV) {
      console.log('[Analytics]', analyticsEvent);
    }
  }, []);

  const getEvents = useCallback(async () => {
    // Get from localStorage
    const localEvents = loadEvents();

    // Try to get from Supabase
    const remoteEvents = await fetchAnalyticsEvents();

    // Merge and deduplicate
    const allEvents = [...localEvents, ...remoteEvents];
    const uniqueEvents = Array.from(
      new Map(allEvents.map(e => [`${e.ts}-${e.userId}-${e.event}`, e])).values()
    );

    return uniqueEvents.sort((a, b) => b.ts - a.ts);
  }, []);

  // ... keep other methods ...

  return {
    log,
    getEvents,
    getEventsByFramework,
    getEventsByWord,
    clearEvents,
  };
};
```

---

## Phase 4: Update Feedback Storage (20 min)

### Step 4.1: Create Feedback API Service
Create `/src/lib/feedbackApi.ts`:
```typescript
import { supabase, isSupabaseEnabled } from './supabase';
import type { FeedbackItem } from '../data/feedback';

export const saveFeedbackItem = async (feedback: FeedbackItem): Promise<void> => {
  if (!isSupabaseEnabled()) {
    return;
  }

  try {
    const { error } = await supabase!
      .from('feedback')
      .insert({
        id: feedback.id,
        session_id: feedback.sessionId,
        user_id: feedback.userId,
        framework: feedback.framework,
        word_id: feedback.wordId,
        step_id: feedback.stepId,
        step_label: feedback.stepLabel,
        thumb: feedback.thumb,
        include: feedback.include,
        difficulty: feedback.difficulty,
        comment: feedback.comment,
        meta: feedback.meta || {},
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save feedback to Supabase:', error);
  }
};

export const fetchFeedback = async (): Promise<FeedbackItem[]> => {
  if (!isSupabaseEnabled()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      ts: new Date(row.created_at).getTime(),
      sessionId: row.session_id,
      userId: row.user_id,
      framework: row.framework,
      wordId: row.word_id,
      stepId: row.step_id,
      stepLabel: row.step_label,
      thumb: row.thumb,
      include: row.include,
      difficulty: row.difficulty,
      comment: row.comment,
      meta: row.meta,
    }));
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return [];
  }
};
```

### Step 4.2: Update Storage Service
Modify `/src/lib/storage.ts` to use Supabase:
```typescript
import { saveFeedbackItem, fetchFeedback } from './feedbackApi';

// ... keep existing code ...

export const addFeedbackItem = (item: FeedbackItem): void => {
  const current = loadFeedback();
  const updated = [...current, item];
  saveFeedback(updated);

  // Save to Supabase (background)
  saveFeedbackItem(item).catch(err => {
    console.error('Background feedback save failed:', err);
  });
};

// Add new function to load from both sources
export const loadAllFeedback = async (): Promise<FeedbackItem[]> => {
  const local = loadFeedback();
  const remote = await fetchFeedback();

  // Merge and deduplicate by ID
  const byId = new Map<string, FeedbackItem>();
  [...local, ...remote].forEach(item => byId.set(item.id, item));

  return Array.from(byId.values()).sort((a, b) => b.ts - a.ts);
};
```

---

## Phase 5: Update UI Components (30 min)

### Step 5.1: Update Compare Page
Modify `/src/pages/ComparePage.tsx`:
```typescript
// Add loading state for remote data
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    const { getEvents } = useAnalytics();
    const allEvents = await getEvents(); // Now fetches from Supabase too
    // ... process events ...
    setLoading(false);
  };
  loadData();
}, []);

// Add loading indicator in render
{loading && <div>Loading analytics data...</div>}
```

### Step 5.2: Update Debug Page
Same pattern as Compare Page - add async data loading.

### Step 5.3: Update Feedback Admin
Modify `/src/pages/FeedbackAdmin.tsx`:
```typescript
import { loadAllFeedback } from '../lib/storage';

useEffect(() => {
  const loadData = async () => {
    const allFeedback = await loadAllFeedback();
    setFeedback(allFeedback);
  };
  loadData();
}, []);
```

---

## Phase 6: Configure Vercel Environment Variables (5 min)

### Step 6.1: Add to Vercel Dashboard
- [ ] Go to https://vercel.com/dashboard
- [ ] Select project: proto-vocab-five-frameworks-28oct
- [ ] Settings → Environment Variables
- [ ] Add:
  - `VITE_SUPABASE_URL` = your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` = your anon public key
- [ ] Apply to: Production, Preview, Development
- [ ] Save

---

## Phase 7: Testing (20 min)

### Step 7.1: Local Testing
```bash
# Start dev server
npm run dev

# Test checklist:
- [ ] Complete a journey → Check localStorage
- [ ] Check browser console → No Supabase errors
- [ ] Go to Supabase dashboard → See analytics_events rows
- [ ] Submit feedback → Check feedback table
- [ ] Open Compare page → See combined data
- [ ] Open Debug page → See all events
- [ ] Open Feedback page → See all feedback
```

### Step 7.2: Test Offline Fallback
```bash
# In browser DevTools:
- [ ] Go offline (Network tab → Offline)
- [ ] Complete a journey
- [ ] Should still work with localStorage
- [ ] Go online
- [ ] Refresh page
- [ ] Data should sync to Supabase
```

### Step 7.3: Test Multi-User
```bash
- [ ] Use app in normal browser
- [ ] Use app in incognito window
- [ ] Use app on different device/phone
- [ ] Check Supabase → Should see 3 different user_ids
- [ ] Check your Compare page → Should see all users' data
```

---

## Phase 8: Deploy & Verify (10 min)

### Step 8.1: Commit & Push
```bash
git add .
git commit -m "Feature: Add Supabase backend for shared analytics and feedback

- Integrated Supabase for persistent storage
- Added device tracking (browser, OS, screen size)
- Analytics and feedback now shared across all users
- localStorage maintained as offline fallback
- Updated Compare/Debug/Feedback pages to load from Supabase"

git push origin main
```

### Step 8.2: Verify Deployment
- [ ] Wait for Vercel deployment (~2 min)
- [ ] Visit live site
- [ ] Complete a journey
- [ ] Check Supabase dashboard → Should see data
- [ ] Share URL with friend
- [ ] Friend uses app
- [ ] Refresh your Compare page → Should see friend's data!

---

## Phase 9: Documentation (10 min)

### Step 9.1: Update README
Add section about backend:
```markdown
## Backend & Data Storage

### localStorage (Offline-First)
- All data saved to browser localStorage immediately
- Works offline
- Persists across page refreshes

### Supabase (Shared Database)
- Analytics and feedback synced to cloud database
- See data from all users
- Automatic background sync
- Graceful fallback if offline

### Data Flow
1. User interacts → Saved to localStorage (instant)
2. Background sync to Supabase (non-blocking)
3. Admin views data → Loads from both sources
4. Data merged and deduplicated

### Privacy
- Anonymous: Only UUIDs, no personal data
- Device fingerprinting for analytics only
- Can clear data anytime from Feedback page
```

---

## Rollback Plan (If Needed)

If Supabase integration causes issues:

```bash
# Remove Supabase dependency
npm uninstall @supabase/supabase-js

# Revert changes
git revert HEAD

# Or keep code but disable Supabase
# Just remove .env.local file - app falls back to localStorage
```

---

## Success Criteria

✅ Analytics events saved to Supabase
✅ Feedback saved to Supabase
✅ Compare page shows multi-user data
✅ Debug page shows all events
✅ Feedback page shows all feedback
✅ App works offline (localStorage fallback)
✅ No errors in browser console
✅ Vercel deployment successful
✅ Environment variables configured
✅ Multi-device testing passed

---

## Estimated Costs

**Supabase Free Tier:**
- 500 MB database
- 2 GB bandwidth/month
- Should handle 16,000+ users

**Vercel Free Tier:**
- Already covered

**Total Cost: $0/month** ✅

---

## Next Steps After Implementation

1. Add "Clear My Data" button in Feedback Admin
2. Add device filter to Compare/Debug pages
3. Add data export (CSV/JSON) from Supabase
4. Consider adding user consent banner (GDPR)
5. Add analytics dashboard with charts
6. Monitor Supabase usage metrics

---

**Ready to implement!** Start with Phase 1 when user approves.
