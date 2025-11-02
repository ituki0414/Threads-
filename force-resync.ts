import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function forceResync() {
  console.log('🗑️  既存の投稿を全て削除中...\n');

  // 全ての投稿を削除
  const { error: deleteError, count } = await supabase
    .from('posts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // 全削除

  if (deleteError) {
    console.error('❌ 削除エラー:', deleteError);
    return;
  }

  console.log(`✅ ${count}件の投稿を削除しました\n`);
  console.log('📥 次に、ブラウザで再読み込みしてください。');
  console.log('   自動的にThreads APIから再同期が開始されます。\n');
  console.log('💡 または、カレンダーページの更新ボタンをクリックしてください。');
}

forceResync();
