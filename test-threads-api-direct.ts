import { ThreadsAPIClient } from './lib/threads-api';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testThreadsAPI() {
  // アカウント情報を取得
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)
    .single();

  if (!accounts) {
    console.error('No account found');
    return;
  }

  console.log('✅ Account found:', accounts.id);

  const threadsClient = new ThreadsAPIClient(accounts.access_token);
  const posts = await threadsClient.getPosts(10);

  console.log(`\n📥 Fetched ${posts.length} posts\n`);

  // 「価格」を含む投稿を探す
  const pricePost = posts.find(p => p.text?.includes('価格'));

  if (pricePost) {
    console.log('🔍 Found price post:');
    console.log('ID:', pricePost.id);
    console.log('Text length:', pricePost.text?.length);
    console.log('Full text:', pricePost.text);
    console.log('Media type:', pricePost.media_type);
    console.log('Has children:', !!pricePost.children);
  } else {
    console.log('⚠️ No price post found. Showing first post:');
    console.log('ID:', posts[0].id);
    console.log('Text:', posts[0].text?.substring(0, 200));
  }
}

testThreadsAPI();
