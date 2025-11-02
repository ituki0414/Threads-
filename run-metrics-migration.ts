import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  console.log('🔄 Adding metrics column to posts table...\n');

  // First, check if the column already exists
  const { data: existingData, error: checkError } = await supabase
    .from('posts')
    .select('metrics')
    .limit(1);

  if (!checkError) {
    console.log('✅ Column already exists!');
    console.log('Sample data:', existingData);
    return;
  }

  console.log('Column does not exist. You need to run this SQL in your Supabase dashboard:\n');
  console.log('----------------------------------------');
  console.log(`
-- Add metrics column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS metrics JSONB
DEFAULT '{"likes": 0, "comments": 0, "saves": 0}'::jsonb;

-- Create index for faster queries on metrics
CREATE INDEX IF NOT EXISTS idx_posts_metrics
ON posts USING GIN (metrics);
  `);
  console.log('----------------------------------------\n');

  console.log('Steps:');
  console.log('1. Go to: https://ctnfyuzeecexbbfbjelv.supabase.co/project/ctnfyuzeecexbbfbjelv/sql/new');
  console.log('2. Paste the SQL above');
  console.log('3. Click "Run"');
  console.log('4. Run this script again to verify');
}

runMigration();
