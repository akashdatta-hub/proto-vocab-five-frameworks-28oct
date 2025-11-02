-- Check current RLS status and policies
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('analytics_events', 'feedback');

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('analytics_events', 'feedback');

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous insert on analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Allow public read on analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Allow delete on analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Enable insert for anon users" ON analytics_events;
DROP POLICY IF EXISTS "Enable read access for all users" ON analytics_events;

DROP POLICY IF EXISTS "Allow anonymous insert on feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public read on feedback" ON feedback;
DROP POLICY IF EXISTS "Allow delete on feedback" ON feedback;
DROP POLICY IF EXISTS "Enable insert for anon users" ON feedback;
DROP POLICY IF EXISTS "Enable read access for all users" ON feedback;

-- Disable RLS temporarily to test (IMPORTANT: Only for testing!)
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- Verify RLS is now disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('analytics_events', 'feedback');
