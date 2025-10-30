import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPost() {
  console.log('🔍 Checking posts with NEO caption...\n');

  // NEOに関する投稿を検索
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .ilike('caption', '%NEO%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Found ${posts?.length || 0} posts with NEO\n`);

  posts?.forEach((post, i) => {
    console.log(`${i + 1}. Post Details:`);
    console.log(`   ID: ${post.id}`);
    console.log(`   Threads ID: ${post.threads_post_id}`);
    console.log(`   State: ${post.state}`);
    console.log(`   Caption: ${post.caption?.substring(0, 60)}...`);
    console.log(`   Scheduled at: ${post.scheduled_at}`);
    console.log(`   Published at: ${post.published_at}`);
    console.log(`   Created at: ${post.created_at}`);
    console.log('');
  });
}

checkPost();
