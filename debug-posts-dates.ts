import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPostDates() {
  console.log('🔍 Checking post dates in database...');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, published_at, scheduled_at, state, caption')
    .eq('state', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Found ${posts?.length} posts`);
  console.log('\n📅 First 20 posts dates:');

  posts?.forEach((post, idx) => {
    const dateStr = post.published_at || post.scheduled_at;
    if (dateStr) {
      const date = new Date(dateStr);
      console.log(`  ${idx + 1}. ${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${post.caption?.substring(0, 40) || 'No caption'}`);
      console.log(`     Raw: ${dateStr}`);
      console.log(`     ISO: ${date.toISOString()}`);
    } else {
      console.log(`  ${idx + 1}. No date - state: ${post.state}`);
    }
  });

  // 月別集計
  const monthCounts: { [month: string]: number } = {};
  posts?.forEach(post => {
    const dateStr = post.published_at || post.scheduled_at;
    if (dateStr) {
      const date = new Date(dateStr);
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });

  console.log('\n📊 Posts by month (top 20):');
  Object.entries(monthCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([month, count]) => {
      console.log(`  ${month}: ${count}件`);
    });
}

checkPostDates();
