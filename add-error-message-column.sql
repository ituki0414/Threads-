-- Add error_message column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for faster filtering of failed posts
CREATE INDEX IF NOT EXISTS idx_posts_state_error
ON posts (state, error_message)
WHERE state = 'failed';
