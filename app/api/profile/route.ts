import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ThreadsAPIClient } from '@/lib/threads-api';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    console.log('📊 Fetching profile for account:', accountId);

    // アカウント情報を取得
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError) {
      console.error('❌ Error fetching account:', accountError);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 投稿統計を取得
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('account_id', accountId)
      .eq('state', 'published')
      .not('metrics', 'is', null);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    }

    // 統計を計算
    const totalPosts = posts?.length || 0;
    const totalLikes = posts?.reduce((sum, p) => sum + ((p.metrics as any)?.likes || 0), 0) || 0;
    const totalComments = posts?.reduce((sum, p) => sum + ((p.metrics as any)?.comments || 0), 0) || 0;
    const totalSaves = posts?.reduce((sum, p) => sum + ((p.metrics as any)?.saves || 0), 0) || 0;
    const totalEngagement = totalLikes + totalComments + totalSaves;

    // 平均保存率を計算
    let avgSaveRate = 0;
    if (posts && posts.length > 0) {
      const saveRates = posts
        .map((p) => {
          const metrics = p.metrics as any;
          const saves = metrics?.saves || 0;
          const likes = metrics?.likes || 0;
          const comments = metrics?.comments || 0;
          const engagement = likes + comments + saves;
          return engagement > 0 ? (saves / engagement) * 100 : 0;
        })
        .filter((rate) => rate > 0);

      avgSaveRate = saveRates.length > 0
        ? saveRates.reduce((sum, rate) => sum + rate, 0) / saveRates.length
        : 0;
    }

    console.log(`✅ Profile stats: ${totalPosts} posts, ${totalEngagement} total engagement`);

    // Threads APIからプロフィール画像を取得
    let profilePictureUrl = null;
    try {
      const threadsClient = new ThreadsAPIClient(account.access_token);
      const userInfo = await threadsClient.getUser();
      profilePictureUrl = userInfo.threads_profile_picture_url || null;
      console.log('📸 Profile picture URL:', profilePictureUrl ? 'Found' : 'Not found');
    } catch (error) {
      console.error('❌ Failed to fetch profile picture:', error);
      // エラーがあってもプロフィール情報は返す
    }

    return NextResponse.json({
      account: {
        id: account.id,
        username: account.threads_username,
        threadsUserId: account.threads_user_id,
        profilePicture: profilePictureUrl,
        connectedAt: account.created_at,
      },
      stats: {
        totalPosts,
        totalLikes,
        totalComments,
        totalSaves,
        totalEngagement,
        avgSaveRate: Number(avgSaveRate.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
