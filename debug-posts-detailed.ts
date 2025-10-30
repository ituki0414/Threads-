import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPosts() {
  console.log('🔍 Fetching all published posts...\n');

  const { data: allPosts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Total published posts: ${allPosts?.length || 0}\n`);

  // 10月30日の投稿を探す
  const oct30Posts = allPosts?.filter((post) => {
    if (!post.published_at) return false;
    const date = new Date(post.published_at);
    return date.getDate() === 30 && date.getMonth() === 9; // 10月は9（0-indexed）
  });

  console.log(`📅 Posts on October 30: ${oct30Posts?.length || 0}`);
  oct30Posts?.forEach((post, i) => {
    const date = new Date(post.published_at);
    console.log(`\n${i + 1}. ID: ${post.threads_post_id}`);
    console.log(`   Caption: ${post.caption?.substring(0, 60)}...`);
    console.log(`   Published at: ${post.published_at}`);
    console.log(`   Parsed date: ${date.toString()}`);
    console.log(`   Date: ${date.getDate()}, Month: ${date.getMonth()}, Year: ${date.getFullYear()}`);
  });

  // 10月29日の投稿も確認
  const oct29Posts = allPosts?.filter((post) => {
    if (!post.published_at) return false;
    const date = new Date(post.published_at);
    return date.getDate() === 29 && date.getMonth() === 9;
  });

  console.log(`\n📅 Posts on October 29: ${oct29Posts?.length || 0}`);

  // 日付ごとの投稿数を集計
  const postsByDate = new Map<string, number>();
  allPosts?.forEach((post) => {
    if (!post.published_at) return;
    const date = new Date(post.published_at);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    postsByDate.set(dateKey, (postsByDate.get(dateKey) || 0) + 1);
  });

  console.log('\n📊 Posts by date (last 10 days):');
  const sortedDates = Array.from(postsByDate.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 10);

  sortedDates.forEach(([date, count]) => {
    console.log(`   ${date}: ${count} posts`);
  });
}

debugPosts();
