CREATE TABLE commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_id uuid NOT NULL REFERENCES computers(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('wake', 'shutdown')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX commands_computer_id_idx ON commands(computer_id);
CREATE INDEX commands_status_idx ON commands(status);

ALTER TABLE commands DISABLE ROW LEVEL SECURITY;
