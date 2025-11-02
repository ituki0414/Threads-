-- Add permalink column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS permalink TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_permalink ON posts(permalink);
