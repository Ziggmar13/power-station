CREATE TABLE agents (
  computer_id uuid PRIMARY KEY REFERENCES computers(id) ON DELETE CASCADE,
  last_seen timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agents DISABLE ROW LEVEL SECURITY;

-- Enable Realtime for commands table
-- Run this in Supabase Dashboard → Database → Replication, or via SQL:
-- SELECT supabase_realtime.apply_rls('commands', 'INSERT');
-- NOTE: Realtime must be enabled per-table in the Supabase Dashboard UI:
--   Database → Replication → commands table → toggle ON
