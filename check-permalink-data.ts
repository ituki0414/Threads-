import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPermalinkData() {
  console.log('🔍 Permalinkデータの確認\n');

  // 公開済み投稿を取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, permalink, state, caption')
    .eq('state', 'published')
    .limit(5);

  if (error) {
    console.error('❌ エラー:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('公開済み投稿が見つかりません');
    return;
  }

  console.log(`📝 公開済み投稿 (${posts.length}件):\n`);

  for (const post of posts) {
    console.log(`投稿ID: ${post.id}`);
    console.log(`State: ${post.state}`);
    console.log(`Threads投稿ID: ${post.threads_post_id}`);
    console.log(`Permalink: ${post.permalink || '(null)'}`);
    const caption = post.caption ? post.caption.substring(0, 40) : '';
    console.log(`Caption: ${caption}...`);
    console.log('');
  }
}

checkPermalinkData();
