-- Create export_history table to track user exports
CREATE TABLE export_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  export_type VARCHAR(50) NOT NULL DEFAULT 'csv',
  format VARCHAR(10) NOT NULL DEFAULT 'csv',
  session_count INTEGER NOT NULL,
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ NOT NULL,
  fields_exported TEXT[] NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own export history
CREATE POLICY "Users can only see their own export history"
  ON export_history FOR ALL
  USING (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX idx_export_history_user_id ON export_history(user_id);

-- Create index on created_at for sorting by most recent
CREATE INDEX idx_export_history_created_at ON export_history(created_at DESC);

-- Create index on export_type for filtering
CREATE INDEX idx_export_history_export_type ON export_history(export_type);