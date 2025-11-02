import { createClient } from '@supabase/supabase-js';
import { ThreadsAPIClient } from '@/lib/threads-api';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('📊 Starting metrics sync...');

    // アカウント情報を取得
    const { data: accounts } = await supabaseAdmin
      .from('accounts')
      .select('*');

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: 'No accounts found' }, { status: 404 });
    }

    let totalUpdated = 0;

    for (const account of accounts) {
      const threadsClient = new ThreadsAPIClient(account.access_token);

      // 公開済み投稿を取得（threads_post_idがあるもののみ）
      const { data: posts } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('account_id', account.id)
        .eq('state', 'published')
        .not('threads_post_id', 'is', null)
        .order('published_at', { ascending: false })
        .limit(50); // 最新50件のみ

      if (!posts || posts.length === 0) {
        console.log(`No published posts for account ${account.id}`);
        continue;
      }

      console.log(`📈 Syncing metrics for ${posts.length} posts...`);

      for (const post of posts) {
        try {
          // Threads APIからインサイトを取得
          const insights = await threadsClient.getPostInsights(post.threads_post_id);

          // メトリクスを更新
          const { error } = await supabaseAdmin
            .from('posts')
            .update({
              metrics: {
                likes: insights.likes || 0,
                comments: insights.replies || 0,
                saves: insights.reposts || 0, // Threadsでは「保存」の代わりに「リポスト」を使用
              }
            })
            .eq('id', post.id);

          if (error) {
            console.error(`❌ Failed to update metrics for ${post.threads_post_id}:`, error);
          } else {
            totalUpdated++;
            console.log(`✅ Updated metrics for ${post.threads_post_id}: ${insights.likes} likes, ${insights.replies} comments`);
          }

          // API rate limitを避けるため少し待機
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`❌ Error fetching insights for ${post.threads_post_id}:`, err);
          // エラーが出ても続行
        }
      }
    }

    console.log(`✨ Metrics sync complete: ${totalUpdated} posts updated`);

    return NextResponse.json({
      success: true,
      updated: totalUpdated,
    });
  } catch (error) {
    console.error('❌ Metrics sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync metrics' },
      { status: 500 }
    );
  }
}
