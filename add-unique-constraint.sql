-- Add UNIQUE constraint to prevent duplicate posts
-- This will prevent the same threads_post_id from being inserted twice

-- First, we need to remove any existing duplicates before adding the constraint
-- (This should be done separately using the force-remove-duplicates script)

-- Add unique constraint on (account_id, threads_post_id)
-- This ensures that for each account, each threads_post_id appears only once
ALTER TABLE posts
ADD CONSTRAINT posts_account_threads_post_unique
UNIQUE (account_id, threads_post_id);

-- Optional: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_account_threads_post
ON posts (account_id, threads_post_id);
