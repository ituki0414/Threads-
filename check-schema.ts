import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('=== 📋 Checking posts table schema ===\n');

  // Get one post to see all available columns
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data) {
    console.log('Available columns in posts table:');
    const columns = Object.keys(data);
    columns.forEach((col, idx) => {
      console.log(`  ${idx + 1}. ${col}: ${typeof data[col]} = ${JSON.stringify(data[col])}`);
    });

    console.log('\n=== Key columns check ===');
    console.log('✓ id:', 'id' in data);
    console.log('✓ state:', 'state' in data);
    console.log('✓ scheduled_at:', 'scheduled_at' in data);
    console.log('✓ published_at:', 'published_at' in data);
    console.log('✓ retry_count:', 'retry_count' in data);
    console.log('✓ error_message:', 'error_message' in data);
    console.log('✓ threads_post_id:', 'threads_post_id' in data);
    console.log('✓ permalink:', 'permalink' in data);
  }
}

checkSchema().catch(console.error);
