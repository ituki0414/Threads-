import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkThreadsURL() {
  console.log('🔍 Threads投稿URLの確認\n');

  // 公開済み投稿を取得
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'published')
    .not('threads_post_id', 'is', null)
    .limit(5);

  if (!posts || posts.length === 0) {
    console.log('公開済み投稿が見つかりません');
    return;
  }

  console.log(`📝 公開済み投稿 (${posts.length}件):\n`);

  for (const post of posts) {
    console.log(`投稿ID: ${post.id}`);
    console.log(`Threads投稿ID: ${post.threads_post_id}`);
    console.log(`生成されるURL: https://www.threads.net/t/${post.threads_post_id}`);
    const captionPreview = post.caption ? post.caption.substring(0, 50) : '';
    console.log(`Caption: ${captionPreview}...`);
    console.log('');
  }

  // Threads APIから実際のpermalinkを取得
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)
    .single();

  if (account && account.access_token) {
    console.log('\n🌐 Threads APIから実際のpermalinkを取得:\n');

    const firstPostId = posts[0].threads_post_id;
    const response = await fetch(
      `https://graph.threads.net/v1.0/${firstPostId}?fields=id,text,permalink&access_token=${account.access_token}`
    );

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  }
}

checkThreadsURL();
