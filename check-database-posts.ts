import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDatabase() {
  console.log('📊 データベース投稿確認\n');

  // 全投稿数を確認
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ 全投稿数: ${totalCount}件\n`);

  // 状態別の投稿数
  const { data: byState } = await supabase
    .from('posts')
    .select('state')
    .order('state');

  const stateCounts: Record<string, number> = {};
  byState?.forEach(post => {
    stateCounts[post.state] = (stateCounts[post.state] || 0) + 1;
  });

  console.log('📈 状態別投稿数:');
  Object.entries(stateCounts).forEach(([state, count]) => {
    console.log(`   ${state}: ${count}件`);
  });

  // 最新10件の投稿を確認
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(10);

  console.log('\n📅 最新10件の投稿:');
  recentPosts?.forEach((post, idx) => {
    console.log(`\n${idx + 1}. ID: ${post.id}`);
    console.log(`   Threads ID: ${post.threads_post_id}`);
    console.log(`   State: ${post.state}`);
    console.log(`   Published: ${post.published_at}`);
    console.log(`   Caption: ${post.caption?.substring(0, 50)}...`);
    console.log(`   Media: ${post.media?.length || 0}件`);
    console.log(`   Account ID: ${post.account_id}`);
  });

  // アカウント情報も確認
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*');

  console.log('\n👤 アカウント一覧:');
  accounts?.forEach(acc => {
    console.log(`   ID: ${acc.id}`);
    console.log(`   Handle: ${acc.handle}`);
  });
}

checkDatabase();
