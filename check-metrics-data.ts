import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMetricsData() {
  console.log('📊 メトリクスデータの確認\n');

  // メトリクスがある投稿を取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, threads_post_id, metrics, caption, state')
    .eq('state', 'published')
    .not('metrics', 'is', null)
    .order('metrics->likes', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ エラー:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('メトリクスデータが見つかりません');
    return;
  }

  console.log(`📈 Top 10 投稿（いいね数順）:\n`);

  for (const post of posts) {
    const metrics = post.metrics as any;
    console.log(`投稿ID: ${post.threads_post_id}`);
    console.log(`📊 メトリクス: ${metrics.likes || 0} いいね, ${metrics.comments || 0} コメント, ${metrics.saves || 0} 保存`);
    const caption = post.caption ? post.caption.substring(0, 50) : '(本文なし)';
    console.log(`📝 本文: ${caption}...`);
    console.log('');
  }
}

checkMetricsData();
