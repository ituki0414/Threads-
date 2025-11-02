import { ThreadsAPIClient } from './lib/threads-api';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPostsWithMedia() {
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)
    .single();

  if (!account) {
    console.error('No account found');
    return;
  }

  const threadsClient = new ThreadsAPIClient(account.access_token);
  const posts = await threadsClient.getPosts(50);

  console.log('\n🖼️  メディア付き投稿:\n');

  let count = 0;
  for (const post of posts) {
    const hasMedia = post.media_url || post.thumbnail_url || (post.children && post.children.data && post.children.data.length > 0);

    if (hasMedia && count < 5) {
      count++;
      console.log(`${count}. ID: ${post.id}`);
      const textPreview = post.text ? post.text.substring(0, 60) : '';
      console.log(`   Text: ${textPreview}...`);
      console.log(`   Media type: ${post.media_type}`);
      console.log(`   Media URL: ${post.media_url || 'なし'}`);
      console.log(`   Thumbnail URL: ${post.thumbnail_url || 'なし'}`);
      if (post.children) {
        console.log(`   Children (${post.children.data?.length}):`, post.children.data?.map(c => ({
          id: c.id,
          media_type: c.media_type,
          has_url: !!c.media_url,
          has_thumb: !!c.thumbnail_url
        })));
      }
      console.log('');

      // データベースに保存されているか確認
      const { data: dbPost } = await supabase
        .from('posts')
        .select('media')
        .eq('threads_post_id', post.id)
        .single();

      if (dbPost) {
        console.log(`   💾 DB Media: ${JSON.stringify(dbPost.media)}`);
        console.log(`   💾 DB Media count: ${dbPost.media?.length || 0}\n`);
      } else {
        console.log(`   ⚠️  Not in database\n`);
      }
    }
  }

  console.log(`\n✅ Found ${count} posts with media out of ${posts.length} total posts`);
}

checkPostsWithMedia();
