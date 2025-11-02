-- Clicks-Based Journey Report
-- Run this in your Supabase SQL Editor

-- 1. Total Events Overview
SELECT
  'Total Events' as metric,
  COUNT(*) as count
FROM analytics_events;

-- 2. Events by Type (Journey Steps)
SELECT
  event as event_type,
  COUNT(*) as occurrences,
  COUNT(DISTINCT session_id) as unique_sessions,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM analytics_events
GROUP BY event
ORDER BY occurrences DESC;

-- 3. Journey Completion Funnel
WITH journey_steps AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event = 'start_word' THEN session_id END) as started,
    COUNT(DISTINCT CASE WHEN event = 'complete_step' THEN session_id END) as progressed,
    COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) as completed
  FROM analytics_events
)
SELECT
  'Started' as stage, started as sessions, 100.0 as percentage FROM journey_steps
UNION ALL
SELECT
  'Progressed' as stage, progressed as sessions,
  ROUND(100.0 * progressed / NULLIF(started, 0), 2) as percentage
FROM journey_steps
UNION ALL
SELECT
  'Completed' as stage, completed as sessions,
  ROUND(100.0 * completed / NULLIF(started, 0), 2) as percentage
FROM journey_steps;

-- 4. Average Steps per Session
SELECT
  ROUND(AVG(step_count), 2) as avg_steps_per_session,
  MIN(step_count) as min_steps,
  MAX(step_count) as max_steps
FROM (
  SELECT
    session_id,
    COUNT(*) as step_count
  FROM analytics_events
  WHERE event IN ('start_word', 'complete_step', 'complete_word')
  GROUP BY session_id
) session_steps;

-- 5. Journey by Framework
SELECT
  framework,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) as total_events,
  COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) as completions,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) /
        COUNT(DISTINCT session_id), 2) as completion_rate
FROM analytics_events
GROUP BY framework
ORDER BY sessions DESC;

-- 6. Journey by Word
SELECT
  word_id,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) as total_events,
  COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) as completions,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'complete_word' THEN session_id END) /
        COUNT(DISTINCT session_id), 2) as completion_rate
FROM analytics_events
GROUP BY word_id
ORDER BY sessions DESC;

-- 7. Time-Based Activity (by hour)
SELECT
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as events,
  COUNT(DISTINCT session_id) as sessions
FROM analytics_events
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;

-- 8. Device Breakdown
SELECT
  meta->'device'->>'deviceType' as device_type,
  meta->'device'->>'browser' as browser,
  meta->'device'->>'os' as os,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) as total_events
FROM analytics_events
WHERE meta->'device' IS NOT NULL
GROUP BY
  meta->'device'->>'deviceType',
  meta->'device'->>'browser',
  meta->'device'->>'os'
ORDER BY sessions DESC;

-- 9. User Journey Sequences (First 10 sessions)
SELECT
  session_id,
  framework,
  word_id,
  ARRAY_AGG(event ORDER BY created_at) as event_sequence,
  COUNT(*) as event_count,
  MIN(created_at) as journey_start,
  MAX(created_at) as journey_end,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as duration_seconds
FROM analytics_events
GROUP BY session_id, framework, word_id
ORDER BY journey_start DESC
LIMIT 10;

-- 10. Drop-off Analysis (where users stop)
WITH step_order AS (
  SELECT
    session_id,
    event,
    ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) as step_number
  FROM analytics_events
  WHERE event IN ('start_word', 'complete_step', 'complete_word')
),
last_steps AS (
  SELECT
    session_id,
    MAX(step_number) as last_step_reached
  FROM step_order
  GROUP BY session_id
)
SELECT
  last_step_reached,
  COUNT(*) as sessions_dropped,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM last_steps
GROUP BY last_step_reached
ORDER BY last_step_reached;
