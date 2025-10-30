import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMedia() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, caption, media, published_at')
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 最新10件の投稿のメディア情報:\n');

  data.forEach((post, idx) => {
    console.log(`${idx + 1}. ID: ${post.threads_post_id}`);
    console.log(`   本文: ${post.caption?.substring(0, 50)}...`);
    console.log(`   メディア数: ${post.media?.length || 0}`);
    if (post.media && post.media.length > 0) {
      console.log(`   メディアURL:`, post.media);
    }
    console.log('');
  });
}

checkMedia();
