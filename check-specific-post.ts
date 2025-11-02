import { ThreadsAPIClient } from './lib/threads-api';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSpecificPost() {
  // アカウント情報を取得
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)
    .single();

  if (!account) {
    console.error('No account found');
    return;
  }

  console.log('✅ Account found:', account.id);

  const threadsClient = new ThreadsAPIClient(account.access_token);
  const posts = await threadsClient.getPosts(50);

  console.log(`\n📥 Fetched ${posts.length} posts\n`);

  // ロボットに関する投稿を探す
  const robotPost = posts.find(p =>
    p.text?.includes('やばすぎる') &&
    p.text?.includes('ロボット') &&
    p.text?.includes('300万円')
  );

  if (robotPost) {
    console.log('🔍 Found robot post from API:');
    console.log('ID:', robotPost.id);
    console.log('Text:', robotPost.text);
    console.log('Media type:', robotPost.media_type);
    console.log('Media URL:', robotPost.media_url);
    console.log('Thumbnail URL:', robotPost.thumbnail_url);
    console.log('Children:', JSON.stringify(robotPost.children, null, 2));
    console.log('Is reply:', robotPost.is_reply);
    console.log('Reply to ID:', robotPost.reply_to_id);
  } else {
    console.log('⚠️ Robot post not found in recent 50 posts');
    console.log('\nShowing first post with media:');
    const postWithMedia = posts.find(p => p.media_url || p.thumbnail_url);
    if (postWithMedia) {
      console.log('ID:', postWithMedia.id);
      console.log('Text:', postWithMedia.text?.substring(0, 100));
      console.log('Media type:', postWithMedia.media_type);
      console.log('Media URL:', postWithMedia.media_url);
      console.log('Thumbnail URL:', postWithMedia.thumbnail_url);
      console.log('Children:', JSON.stringify(postWithMedia.children, null, 2));
    }
  }

  // データベースの該当投稿も確認
  console.log('\n\n📊 Database version:');
  const { data: dbPost } = await supabase
    .from('posts')
    .select('*')
    .eq('threads_post_id', '18095959264840108')
    .single();

  if (dbPost) {
    console.log('DB ID:', dbPost.id);
    console.log('Caption:', dbPost.caption);
    console.log('Media array:', dbPost.media);
    console.log('Media count:', dbPost.media?.length || 0);
  }
}

checkSpecificPost();
