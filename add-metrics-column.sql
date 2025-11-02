-- Add metrics column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{"likes": 0, "comments": 0, "saves": 0}'::jsonb;

-- Create index for faster queries on metrics
CREATE INDEX IF NOT EXISTS idx_posts_metrics ON posts USING GIN (metrics);

-- Add comment to explain the structure
COMMENT ON COLUMN posts.metrics IS 'Engagement metrics from Threads API: {"likes": number, "comments": number, "saves": number}';
