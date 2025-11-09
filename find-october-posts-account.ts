import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findOctoberPosts() {
  console.log('🔍 Finding which accounts have October 2025 posts...\n');

  // Get October 2025 posts with account info
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, published_at, scheduled_at, state, caption, account_id, accounts(id, threads_user_id)')
    .gte('published_at', '2025-10-01')
    .lt('published_at', '2025-11-01')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('❌ No October 2025 posts found in any account');
    return;
  }

  console.log(`✅ Found ${posts.length} October 2025 posts\n`);

  // Group by account
  const byAccount: { [accountId: string]: any[] } = {};
  posts.forEach(post => {
    const accountId = post.account_id;
    if (!byAccount[accountId]) {
      byAccount[accountId] = [];
    }
    byAccount[accountId].push(post);
  });

  // Display by account
  Object.entries(byAccount).forEach(([accountId, accountPosts]) => {
    const account = (accountPosts[0] as any).accounts;
    console.log(`📊 Account: ${accountId}`);
    console.log(`   Threads User ID: ${account?.threads_user_id || 'N/A'}`);
    console.log(`   October posts: ${accountPosts.length}\n`);

    console.log('   Sample posts:');
    accountPosts.slice(0, 5).forEach((post: any) => {
      const date = new Date(post.published_at || post.scheduled_at);
      console.log(`   - ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`);
      console.log(`     ${post.caption?.substring(0, 60) || 'No caption'}...`);
    });
    console.log('');
  });

  // Show current logged-in account
  console.log('\n💡 Currently logged-in account: f7337436-c6c5-4700-ad2c-4f696feb0f22');
  if (byAccount['f7337436-c6c5-4700-ad2c-4f696feb0f22']) {
    console.log('   ✅ This account HAS October posts!');
  } else {
    console.log('   ❌ This account does NOT have October posts');
    console.log('   You need to login with one of the accounts listed above');
  }
}

findOctoberPosts();
