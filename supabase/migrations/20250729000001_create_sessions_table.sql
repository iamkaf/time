-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  tags TEXT[],
  start_timestamp TIMESTAMPTZ NOT NULL,
  end_timestamp TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own sessions
CREATE POLICY "Users can only see their own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Create index on start_timestamp for sorting
CREATE INDEX idx_sessions_start_timestamp ON sessions(start_timestamp DESC);

-- Create index on tags for filtering
CREATE INDEX idx_sessions_tags ON sessions USING GIN(tags);