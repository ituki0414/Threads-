-- Check for duplicate threads_post_id entries
SELECT
  threads_post_id,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at) as post_ids,
  array_agg(created_at ORDER BY created_at) as created_dates
FROM posts
WHERE threads_post_id IS NOT NULL
GROUP BY threads_post_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 20;
