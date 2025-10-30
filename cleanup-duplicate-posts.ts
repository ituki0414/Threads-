import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicates() {
  console.log('🔍 Finding scheduled posts with null threads_post_id...\n');

  // threads_post_idがnullで、stateがscheduledの投稿を取得
  const { data: scheduledPosts, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'scheduled')
    .is('threads_post_id', null);

  if (fetchError) {
    console.error('❌ Error fetching posts:', fetchError.message);
    return;
  }

  console.log(`✅ Found ${scheduledPosts?.length || 0} scheduled posts without threads_post_id\n`);

  if (!scheduledPosts || scheduledPosts.length === 0) {
    console.log('✨ No duplicate posts to clean up!');
    return;
  }

  // 各投稿の詳細を表示
  scheduledPosts.forEach((post, i) => {
    console.log(`${i + 1}. ID: ${post.id}`);
    console.log(`   Caption: ${post.caption?.substring(0, 60)}...`);
    console.log(`   Scheduled at: ${post.scheduled_at}`);
    console.log(`   Created at: ${post.created_at}`);
    console.log('');
  });

  // 各投稿について、同じcaptionを持つpublished投稿が存在するか確認
  const toDelete: string[] = [];

  for (const scheduledPost of scheduledPosts) {
    const { data: publishedPosts, error: checkError } = await supabase
      .from('posts')
      .select('id, threads_post_id, caption')
      .eq('state', 'published')
      .ilike('caption', scheduledPost.caption.substring(0, 50) + '%');

    if (!checkError && publishedPosts && publishedPosts.length > 0) {
      console.log(`🔄 Found published version of scheduled post ${scheduledPost.id}`);
      console.log(`   Published as: ${publishedPosts[0].threads_post_id}`);
      toDelete.push(scheduledPost.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('\n✨ No duplicate scheduled posts found!');
    return;
  }

  console.log(`\n🗑️  Deleting ${toDelete.length} duplicate scheduled posts...`);

  // 削除実行
  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .in('id', toDelete);

  if (deleteError) {
    console.error('❌ Error deleting posts:', deleteError.message);
  } else {
    console.log(`✅ Successfully deleted ${toDelete.length} duplicate posts!`);
  }
}

cleanupDuplicates();
