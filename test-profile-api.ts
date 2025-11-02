import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testProfileAPI() {
  console.log('🔍 Testing Profile API...\n');

  // アカウント情報を取得
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .limit(1);

  if (accountError) {
    console.error('❌ Error fetching accounts:', accountError);
    return;
  }

  if (!accounts || accounts.length === 0) {
    console.log('⚠️ No accounts found');
    return;
  }

  const account = accounts[0];
  console.log('📊 Account Info:');
  console.log(`  ID: ${account.id}`);
  console.log(`  Username: ${account.username}`);
  console.log(`  Threads User ID: ${account.threads_user_id}`);
  console.log(`  Access Token: ${account.access_token ? '✓' : '✗'}`);
  console.log(`  Created At: ${new Date(account.created_at).toLocaleString('ja-JP')}`);

  // 投稿統計を取得
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', account.id)
    .eq('state', 'published')
    .not('metrics', 'is', null);

  if (postsError) {
    console.error('❌ Error fetching posts:', postsError);
    return;
  }

  const totalPosts = posts?.length || 0;
  const totalLikes = posts?.reduce((sum, p) => sum + ((p.metrics as any)?.likes || 0), 0) || 0;
  const totalComments = posts?.reduce((sum, p) => sum + ((p.metrics as any)?.comments || 0), 0) || 0;
  const totalSaves = posts?.reduce((sum, p) => sum + ((p.metrics as any)?.saves || 0), 0) || 0;
  const totalEngagement = totalLikes + totalComments + totalSaves;

  console.log('\n📈 Statistics:');
  console.log(`  Total Posts: ${totalPosts}`);
  console.log(`  Total Likes: ${totalLikes}`);
  console.log(`  Total Comments: ${totalComments}`);
  console.log(`  Total Saves: ${totalSaves}`);
  console.log(`  Total Engagement: ${totalEngagement}`);

  // 平均保存率
  let avgSaveRate = 0;
  if (posts && posts.length > 0) {
    const saveRates = posts
      .map((p) => {
        const metrics = p.metrics as any;
        const saves = metrics?.saves || 0;
        const likes = metrics?.likes || 0;
        const comments = metrics?.comments || 0;
        const engagement = likes + comments + saves;
        return engagement > 0 ? (saves / engagement) * 100 : 0;
      })
      .filter((rate) => rate > 0);

    avgSaveRate = saveRates.length > 0
      ? saveRates.reduce((sum, rate) => sum + rate, 0) / saveRates.length
      : 0;
  }

  console.log(`  Average Save Rate: ${avgSaveRate.toFixed(1)}%`);

  // プロフィールAPIエンドポイントをテスト
  console.log('\n🔍 Testing Profile API Endpoint...');
  try {
    const response = await fetch(`http://localhost:3000/api/profile?account_id=${account.id}`);
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }
    const apiData = await response.json();
    console.log('\n✅ API Response:');
    console.log(`  Username: ${apiData.account.username}`);
    console.log(`  Threads User ID: ${apiData.account.threadsUserId}`);
    console.log(`  Profile Picture: ${apiData.account.profilePicture || '(Not found)'}`);
    console.log(`  Total Posts: ${apiData.stats.totalPosts}`);
    console.log(`  Total Engagement: ${apiData.stats.totalEngagement}`);
    console.log(`  Average Save Rate: ${apiData.stats.avgSaveRate}%`);
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

testProfileAPI();
