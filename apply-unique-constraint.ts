import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyConstraint() {
  console.log('🔧 Applying UNIQUE constraint...\n');

  // Execute the constraint SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE posts
      ADD CONSTRAINT posts_account_threads_post_unique
      UNIQUE (account_id, threads_post_id);

      CREATE INDEX IF NOT EXISTS idx_posts_account_threads_post
      ON posts (account_id, threads_post_id);
    `
  });

  if (error) {
    // Try alternative method - using raw SQL via Supabase Admin API
    console.log('⚠️ exec_sql not available, trying alternative method...\n');
    console.log('Please run this SQL manually in Supabase Dashboard:\n');
    console.log('---');
    console.log('ALTER TABLE posts');
    console.log('ADD CONSTRAINT posts_account_threads_post_unique');
    console.log('UNIQUE (account_id, threads_post_id);');
    console.log('');
    console.log('CREATE INDEX IF NOT EXISTS idx_posts_account_threads_post');
    console.log('ON posts (account_id, threads_post_id);');
    console.log('---');
  } else {
    console.log('✅ Unique constraint applied successfully!');
  }
}

applyConstraint().catch(console.error);
