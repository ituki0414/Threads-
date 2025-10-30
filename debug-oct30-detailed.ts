import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOct30() {
  console.log('🔍 Fetching ALL Oct 30 posts...\n');

  // 10月30日のすべての投稿を取得（published と scheduled）
  const { data: allPosts, error } = await supabase
    .from('posts')
    .select('*')
    .in('state', ['published', 'scheduled'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('scheduled_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  // 10月30日にフィルター
  const oct30Posts = allPosts?.filter(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDate() === 30 && date.getMonth() === 9 && date.getFullYear() === 2025;
  });

  console.log(`✅ Total Oct 30 posts: ${oct30Posts?.length || 0}\n`);

  oct30Posts?.forEach((post, i) => {
    const dateStr = post.state === 'published' ? post.published_at : post.scheduled_at;
    const date = new Date(dateStr!);

    console.log(`${i + 1}. ${post.threads_post_id || 'NO_ID'}`);
    console.log(`   State: ${post.state}`);
    console.log(`   Time: ${date.getHours()}時${String(date.getMinutes()).padStart(2, '0')}分 (JST: ${date.toLocaleString('ja-JP')})`);
    console.log(`   Caption: ${post.caption?.substring(0, 60)}...`);
    console.log(`   Published at: ${post.published_at}`);
    console.log(`   Scheduled at: ${post.scheduled_at}`);
    console.log('');
  });

  // 16:32の投稿を特定
  const target = oct30Posts?.find(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getHours() === 16 && date.getMinutes() === 32;
  });

  if (target) {
    console.log('🎯 Found 16:32 post!');
    console.log('   ID:', target.id);
    console.log('   Threads ID:', target.threads_post_id);
    console.log('   Caption:', target.caption?.substring(0, 100));
  } else {
    console.log('❌ 16:32 post NOT FOUND in database!');
  }
}

debugOct30();
