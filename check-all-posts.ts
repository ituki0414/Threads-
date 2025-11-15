import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllPosts() {
  console.log('📋 Checking all posts in database...\n');

  // すべての投稿を取得
  const { data: allPosts, error } = await supabase
    .from('posts')
    .select('id, caption, state, scheduled_at, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Total posts found: ${allPosts?.length || 0}\n`);

  if (allPosts && allPosts.length > 0) {
    console.log('Recent posts:');
    console.log('='.repeat(80));
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.caption.substring(0, 50)}...`);
      console.log(`   ID: ${post.id}`);
      console.log(`   State: ${post.state}`);
      console.log(`   Scheduled: ${post.scheduled_at || 'N/A'}`);
      console.log(`   Published: ${post.published_at || 'N/A'}`);
      console.log(`   Created: ${post.created_at}`);
      console.log('');
    });
  }

  // TESTポストを明示的に検索
  console.log('\n🔍 Searching for TEST posts...');
  const { data: testPosts } = await supabase
    .from('posts')
    .select('*')
    .ilike('caption', '%TEST%');

  console.log(`Found ${testPosts?.length || 0} posts with "TEST" in caption`);

  if (testPosts && testPosts.length > 0) {
    testPosts.forEach(post => {
      console.log(`\n⚠️ Found TEST post:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Caption: ${post.caption}`);
      console.log(`   State: ${post.state}`);
    });
  } else {
    console.log('✅ No TEST posts found in database');
  }
}

checkAllPosts().catch(console.error);
