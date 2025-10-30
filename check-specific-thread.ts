import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkThread() {
  // 「価格」という文字を含む投稿を検索
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .ilike('caption', '%価格%')
    .order('published_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 「価格」を含む投稿:\n');

  data.forEach((post, idx) => {
    console.log(`${idx + 1}. ID: ${post.threads_post_id}`);
    console.log(`   本文: ${post.caption?.substring(0, 100)}...`);
    console.log(`   本文の長さ: ${post.caption?.length || 0}文字`);
    console.log(`   メディア数: ${post.media?.length || 0}`);
    console.log(`   スレッド数: ${post.threads?.length || 0}`);
    if (post.threads && post.threads.length > 0) {
      console.log(`   スレッド内容:`, post.threads);
    }
    console.log('');
  });
}

checkThread();
