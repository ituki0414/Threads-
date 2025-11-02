import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixDuplicates() {
  console.log('🔍 重複投稿を確認中...\n');

  // 全投稿を取得
  const { data: allPosts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: true });

  if (!allPosts) {
    console.error('投稿が見つかりません');
    return;
  }

  // threads_post_id でグループ化
  const groupedByThreadsId: Record<string, typeof allPosts> = {};

  for (const post of allPosts) {
    const threadsId = post.threads_post_id;
    if (!groupedByThreadsId[threadsId]) {
      groupedByThreadsId[threadsId] = [];
    }
    groupedByThreadsId[threadsId].push(post);
  }

  // 重複を確認
  let duplicateCount = 0;
  let deletedCount = 0;

  for (const [threadsId, posts] of Object.entries(groupedByThreadsId)) {
    if (posts.length > 1) {
      duplicateCount++;
      console.log(`📋 重複: ${threadsId} (${posts.length}件)`);

      // 最初の投稿以外を削除
      const toDelete = posts.slice(1);
      for (const post of toDelete) {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);

        if (error) {
          console.error(`   ❌ 削除失敗: ${post.id}`, error);
        } else {
          deletedCount++;
          console.log(`   ✅ 削除: ${post.id}`);
        }
      }
      console.log('');
    }
  }

  console.log(`\n✨ 完了:`);
  console.log(`   重複グループ: ${duplicateCount}件`);
  console.log(`   削除した投稿: ${deletedCount}件`);
  console.log(`   残った投稿: ${Object.keys(groupedByThreadsId).length}件\n`);
}

fixDuplicates();
