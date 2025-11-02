# Supabase Setup Instructions

## Step 1: Create Database Tables

Go to your Supabase project dashboard at [https://app.supabase.com](https://app.supabase.com), navigate to the SQL Editor, and run the following SQL:

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

-- Indexes for analytics_events
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_framework ON analytics_events(framework);
CREATE INDEX idx_analytics_word ON analytics_events(word_id);
CREATE INDEX idx_analytics_event ON analytics_events(event);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_device ON analytics_events(device_fingerprint);

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

-- Indexes for feedback
CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_framework ON feedback(framework);
CREATE INDEX idx_feedback_word ON feedback(word_id);
CREATE INDEX idx_feedback_step ON feedback(step_id);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);

-- Row Level Security (RLS) Policies
-- Enable RLS on both tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous tracking)
CREATE POLICY "Allow anonymous insert on analytics_events"
  ON analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (for multi-user analytics)
CREATE POLICY "Allow public read on analytics_events"
  ON analytics_events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on feedback"
  ON feedback
  FOR SELECT
  USING (true);

-- Allow anyone to delete (for reset functionality)
CREATE POLICY "Allow delete on analytics_events"
  ON analytics_events
  FOR DELETE
  USING (true);

CREATE POLICY "Allow delete on feedback"
  ON feedback
  FOR DELETE
  USING (true);
```

## Step 2: Verify Tables Created

After running the SQL, verify that both tables exist:
- Go to "Table Editor" in Supabase dashboard
- You should see `analytics_events` and `feedback` tables

## Step 3: Test the Application

### Local Testing
1. Dev server should already have the environment variables from `.env.local`
2. Run `npm run dev`
3. Visit http://localhost:5175/
4. Complete a learning journey
5. Check the "Analytics Debug" page to see if events are being tracked
6. Check your Supabase dashboard → Table Editor → analytics_events to verify data is being saved

### Production Testing
1. Visit: https://proto-vocab-five-frameworks-28oct-21bfyl20c.vercel.app
2. Complete a learning journey
3. Open another browser (or incognito window) and complete another journey
4. Go to "Compare Frameworks" page - you should see data from BOTH sessions
5. Check Supabase dashboard to verify all data is being stored

## Step 4: Verify Multi-User Analytics

To test multi-user functionality:
1. Open the app in Browser 1 (e.g., Chrome)
2. Complete the Bloom's framework journey for word "river"
3. Open the app in Browser 2 (e.g., Firefox or Incognito)
4. Complete the CEFR framework journey for word "festival"
5. In Browser 1, go to "Compare Frameworks" - you should see data from BOTH users
6. In Browser 2, go to "Compare Frameworks" - you should see the SAME data
7. Check "Feedback Dashboard" in both browsers - should show combined feedback

## Data Flow

### How it Works:
1. **Offline-First**: All events are saved to localStorage immediately
2. **Background Sync**: Every 30 seconds, pending events sync to Supabase
3. **Multi-User**: When loading analytics, app fetches from Supabase (all users' data)
4. **Fallback**: If Supabase is unreachable, falls back to localStorage

### Device Tracking:
Each event includes device information:
- Device type (mobile/tablet/desktop)
- Browser (Chrome, Firefox, Safari, etc.)
- OS (Windows, macOS, Linux, iOS, Android)
- Screen size
- Timezone
- Device fingerprint (anonymous identifier)

## Troubleshooting

### Issue: Data not syncing to Supabase
1. Open browser console (F12)
2. Look for error messages starting with `[Analytics]` or `[Feedback]`
3. Verify Supabase credentials are correct
4. Check Supabase dashboard → Logs for any errors

### Issue: RLS policies blocking requests
If you see permission errors:
1. Go to Supabase → Authentication → Policies
2. Verify the policies above are created correctly
3. Make sure "Enable RLS" is ON for both tables

### Issue: Environment variables not loaded
For production:
1. Run `vercel env ls` to verify variables are set
2. Redeploy: `vercel --prod`

For local:
1. Verify `.env.local` file exists with correct values
2. Restart dev server: `npm run dev`

## Sample Analytics Queries

You can run these in Supabase SQL Editor to analyze the data:

```sql
-- Total events by framework
SELECT framework, COUNT(*) as event_count
FROM analytics_events
GROUP BY framework
ORDER BY event_count DESC;

-- Events by device type
SELECT meta->'device'->>'deviceType' as device_type, COUNT(*) as count
FROM analytics_events
WHERE meta->'device' IS NOT NULL
GROUP BY device_type;

-- Completion rate by framework
SELECT
  framework,
  COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) as completions,
  COUNT(DISTINCT session_id) as total_sessions,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) /
        COUNT(DISTINCT session_id), 2) as completion_rate
FROM analytics_events
GROUP BY framework;

-- Feedback summary
SELECT
  framework,
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN thumb = 'up' THEN 1 END) as thumbs_up,
  COUNT(CASE WHEN thumb = 'down' THEN 1 END) as thumbs_down,
  ROUND(AVG(CASE
    WHEN difficulty = 'easy' THEN 1
    WHEN difficulty = 'medium' THEN 2
    WHEN difficulty = 'difficult' THEN 3
  END), 2) as avg_difficulty
FROM feedback
GROUP BY framework;
```

## Next Steps

Once everything is working:
1. Monitor Supabase usage (free tier: 500MB database, 2GB bandwidth/month)
2. Set up Supabase email alerts for quota warnings
3. Consider upgrading to Pro tier if you need more capacity
4. Add more analytics queries to the Compare and Debug pages
5. Export data periodically for backup

## Security Notes

- The app uses anonymous tracking (no personal information)
- Device fingerprint is a simple hash, not personally identifiable
- All data is public-readable (anyone can see all analytics)
- If you need private data in the future, update RLS policies to use authentication
