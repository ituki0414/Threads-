import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDuplicates() {
  const accId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Checking for duplicate posts...\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, published_at, caption, state')
    .eq('account_id', accId)
    .in('state', ['scheduled', 'published'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(10000);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total posts: ${posts?.length}\n`);

  // Check for duplicates by threads_post_id
  const byThreadsPostId: { [key: string]: any[] } = {};
  posts?.forEach(post => {
    const key = post.threads_post_id || 'null';
    if (!byThreadsPostId[key]) {
      byThreadsPostId[key] = [];
    }
    byThreadsPostId[key].push(post);
  });

  // Find duplicates
  const duplicates = Object.entries(byThreadsPostId).filter(([_, posts]) => posts.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`⚠️ Found ${duplicates.length} duplicate threads_post_ids:\n`);

  duplicates.slice(0, 10).forEach(([threadsPostId, dupPosts]) => {
    console.log(`📌 threads_post_id: ${threadsPostId}`);
    console.log(`   Duplicates: ${dupPosts.length} records`);
    console.log(`   Caption: ${dupPosts[0].caption?.substring(0, 50)}...`);
    console.log(`   Database IDs: ${dupPosts.map(p => p.id.substring(0, 8)).join(', ')}`);
    console.log('');
  });

  // Count total duplicates
  const totalDuplicateRecords = duplicates.reduce((sum, [_, posts]) => sum + posts.length - 1, 0);
  console.log(`\n📊 Summary:`);
  console.log(`   Total posts: ${posts?.length}`);
  console.log(`   Unique threads_post_ids: ${Object.keys(byThreadsPostId).length}`);
  console.log(`   Duplicate records: ${totalDuplicateRecords}`);
  console.log(`   Should be: ${posts!.length - totalDuplicateRecords}`);
}

checkDuplicates();
