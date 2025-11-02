import { createClient } from '@supabase/supabase-js';
import { ThreadsAPIClient } from './lib/threads-api';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function backfillPermalinks() {
  console.log('🔄 既存投稿にpermalinkを追加中...\n');

  // アカウント情報を取得
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)
    .single();

  if (!account) {
    console.error('❌ アカウントが見つかりません');
    return;
  }

  // permalinkがnullの公開済み投稿を取得
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'published')
    .is('permalink', null)
    .not('threads_post_id', 'is', null);

  if (!posts || posts.length === 0) {
    console.log('✅ 更新が必要な投稿はありません');
    return;
  }

  console.log(`📝 ${posts.length}件の投稿を更新します\n`);

  const threadsClient = new ThreadsAPIClient(account.access_token);
  let updatedCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    try {
      // Threads APIから投稿詳細を取得
      const threadsPost = await threadsClient.getPost(post.threads_post_id);

      // permalinkを更新
      const { error } = await supabase
        .from('posts')
        .update({ permalink: threadsPost.permalink })
        .eq('id', post.id);

      if (error) {
        console.error(`❌ 更新失敗: ${post.threads_post_id}`, error);
        errorCount++;
      } else {
        updatedCount++;
        console.log(`✅ 更新: ${post.threads_post_id} → ${threadsPost.permalink}`);
      }

      // API rate limitを避けるため少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`❌ エラー: ${post.threads_post_id}`, err);
      errorCount++;
    }
  }

  console.log(`\n✨ 完了: ${updatedCount}件更新、${errorCount}件エラー`);
}

backfillPermalinks();
