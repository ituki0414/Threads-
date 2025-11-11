import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function forceRemoveDuplicates() {
  const accId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 FORCE removing all duplicates (keeping oldest created_at for each threads_post_id)...\n');

  // Get ALL posts for this account
  const { data: allPosts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, created_at')
    .eq('account_id', accId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total posts: ${allPosts?.length}\n`);

  // Group by threads_post_id, keep the FIRST (oldest) one only
  const keep = new Map<string, string>();  // threads_post_id -> id to keep
  const toDelete: string[] = [];

  allPosts?.forEach(post => {
    const key = post.threads_post_id || `no_id_${post.id}`;

    if (!keep.has(key)) {
      // First occurrence - keep this one
      keep.set(key, post.id);
    } else {
      // Duplicate - delete this one
      toDelete.push(post.id);
    }
  });

  console.log(`📊 Analysis:`);
  console.log(`   Unique threads_post_ids: ${keep.size}`);
  console.log(`   Records to keep: ${keep.size}`);
  console.log(`   Records to delete: ${toDelete.length}\n`);

  if (toDelete.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`⚠️  Will delete ${toDelete.length} duplicate records`);
  console.log('   Waiting 3 seconds... (CTRL+C to cancel)\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Delete ALL duplicates in one batch (Supabase can handle it)
  console.log('🗑️  Deleting all duplicates...\n');

  // Split into batches of 500
  const batchSize = 500;
  let deleted = 0;

  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);

    const { error: delError, count } = await supabase
      .from('posts')
      .delete({ count: 'exact' })
      .in('id', batch);

    if (delError) {
      console.error(`❌ Error deleting batch:`, delError);
      break;
    } else {
      deleted += count || 0;
      console.log(`✅ Deleted ${count} records (total: ${deleted}/${toDelete.length})`);
    }
  }

  console.log(`\n✨ Cleanup complete!`);
  console.log(`   Deleted: ${deleted} duplicates`);

  // Final verification
  const { data: finalPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('account_id', accId);

  console.log(`\n📊 Final verification:`);
  console.log(`   Posts remaining: ${finalPosts?.length}`);
  console.log(`   Expected: ${keep.size}`);

  if (finalPosts?.length === keep.size) {
    console.log('\n✅ SUCCESS! All duplicates removed');
  } else {
    console.log(`\n⚠️  WARNING: Expected ${keep.size} but got ${finalPosts?.length}`);
  }
}

forceRemoveDuplicates();
