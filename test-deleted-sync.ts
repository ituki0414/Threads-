import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDeletedSync() {
  console.log('🧪 Testing Deleted Post Sync Feature\n');
  console.log('=' .repeat(80));

  // 1. 現在の公開済み投稿数を確認
  const { data: beforePosts, error: beforeError } = await supabase
    .from('posts')
    .select('id, caption, threads_post_id, state')
    .eq('state', 'published')
    .not('threads_post_id', 'is', null)
    .order('published_at', { ascending: false })
    .limit(10);

  if (beforeError) {
    console.error('❌ Error:', beforeError);
    return;
  }

  console.log(`\n📊 Current published posts: ${beforePosts.length}`);
  console.log('\nRecent posts:');
  beforePosts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.caption.substring(0, 50)}...`);
    console.log(`   Threads ID: ${post.threads_post_id}`);
    console.log(`   DB ID: ${post.id}\n`);
  });

  // 2. Sync APIを実行
  console.log('\n🔄 Running sync API...\n');

  const accountId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22'; // key_aiagent account

  const response = await fetch('https://threadstep.vercel.app/api/posts/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account_id: accountId }),
  });

  const result = await response.json();
  console.log('📥 Sync result:');
  console.log(JSON.stringify(result, null, 2));

  // 3. Sync後の投稿数を確認
  const { data: afterPosts } = await supabase
    .from('posts')
    .select('id, caption, threads_post_id, state')
    .eq('state', 'published')
    .not('threads_post_id', 'is', null)
    .order('published_at', { ascending: false })
    .limit(10);

  console.log(`\n\n📊 After sync: ${afterPosts?.length || 0} published posts`);

  // 4. 削除された投稿を確認
  if (beforePosts.length !== afterPosts?.length) {
    const deletedCount = beforePosts.length - (afterPosts?.length || 0);
    console.log(`\n✅ Successfully detected and removed ${deletedCount} deleted posts!`);

    const beforeIds = new Set(beforePosts.map(p => p.threads_post_id));
    const afterIds = new Set(afterPosts?.map(p => p.threads_post_id) || []);

    const deletedThreadsIds = Array.from(beforeIds).filter(id => !afterIds.has(id));
    if (deletedThreadsIds.length > 0) {
      console.log('\n🗑️  Deleted Threads post IDs:');
      deletedThreadsIds.forEach(id => console.log(`   - ${id}`));
    }
  } else {
    console.log('\n✅ No posts were deleted on Threads');
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 Test completed!\n');
}

testDeletedSync().catch(console.error);
