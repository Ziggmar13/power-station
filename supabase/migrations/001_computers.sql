CREATE TABLE computers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mac_address text NOT NULL,
  broadcast_address text NOT NULL DEFAULT '255.255.255.255',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE computers DISABLE ROW LEVEL SECURITY;
