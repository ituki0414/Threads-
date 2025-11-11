import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function removeDuplicates() {
  const accId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Finding and removing duplicate posts...\n');

  // Get ALL posts (no state filter)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, published_at, created_at, state')
    .eq('account_id', accId)
    .order('created_at', { ascending: true }); // Oldest first

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total posts in DB: ${posts?.length}\n`);

  // Group by threads_post_id and keep only the oldest one
  const seen = new Set<string>();
  const toDelete: string[] = [];

  posts?.forEach(post => {
    const key = post.threads_post_id || `null_${post.id}`;

    if (seen.has(key)) {
      // This is a duplicate - mark for deletion
      toDelete.push(post.id);
    } else {
      // This is the first occurrence - keep it
      seen.add(key);
    }
  });

  console.log(`📊 Summary:`);
  console.log(`   Unique posts: ${seen.size}`);
  console.log(`   Duplicates to delete: ${toDelete.length}\n`);

  if (toDelete.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log('⚠️  About to delete duplicates. Continue? (CTRL+C to cancel)');
  console.log('   Waiting 5 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🗑️  Deleting duplicates in batches of 100...\n');

  // Delete in batches to avoid timeout
  const batchSize = 100;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .in('id', batch);

    if (deleteError) {
      console.error(`❌ Error deleting batch ${i / batchSize + 1}:`, deleteError);
    } else {
      console.log(`✅ Deleted batch ${i / batchSize + 1} (${batch.length} records)`);
    }
  }

  console.log('\n✨ Cleanup complete!');
  console.log(`   Deleted: ${toDelete.length} duplicates`);
  console.log(`   Remaining: ${seen.size} unique posts`);

  // Verify
  const { data: afterPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('account_id', accId);

  console.log(`\n📊 Final count: ${afterPosts?.length} posts in database`);
}

removeDuplicates();
