const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPosts() {
  console.log('🔍 Checking posts in Supabase...\n');

  // 全投稿を取得
  const { data: allPosts, error: allError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching all posts:', allError);
    return;
  }

  console.log(`📊 Total posts in database: ${allPosts?.length || 0}\n`);

  if (allPosts && allPosts.length > 0) {
    console.log('📋 Posts breakdown:');
    const byState = {};
    allPosts.forEach(post => {
      byState[post.state] = (byState[post.state] || 0) + 1;
    });
    Object.keys(byState).forEach(state => {
      console.log(`  - ${state}: ${byState[state]} posts`);
    });

    console.log('\n📅 Post dates:');
    allPosts.forEach(post => {
      console.log(`\n  ID: ${post.id}`);
      console.log(`  State: ${post.state}`);
      console.log(`  Caption: ${post.caption?.substring(0, 50) || 'no caption'}...`);
      console.log(`  scheduled_at: ${post.scheduled_at || 'null'}`);
      console.log(`  published_at: ${post.published_at || 'null'}`);
      console.log(`  created_at: ${post.created_at}`);
    });
  }

  // 特定のアカウントIDの投稿を確認
  const accountId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';
  const { data: accountPosts, error: accountError } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accountId)
    .in('state', ['scheduled', 'published']);

  console.log(`\n🔑 Posts for account ${accountId}: ${accountPosts?.length || 0}`);

  if (accountPosts && accountPosts.length > 0) {
    accountPosts.forEach(post => {
      const dateStr = post.state === 'published' && post.published_at
        ? post.published_at
        : post.scheduled_at;
      console.log(`\n  ✅ ${post.state.toUpperCase()}`);
      console.log(`     Date used: ${dateStr ? new Date(dateStr).toLocaleString('ja-JP') : 'no date'}`);
      console.log(`     Caption: ${post.caption?.substring(0, 50) || 'no caption'}...`);
    });
  }
}

checkPosts().catch(console.error);
