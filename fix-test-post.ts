import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTestPost() {
  const testPostId = '55725e6a-68a5-490d-b08c-f63f9ec6c664';

  // 3分後の時刻を設定
  const threeMinutesLater = new Date(Date.now() + 3 * 60 * 1000);
  const scheduledTime = threeMinutesLater.toISOString();

  console.log('🔧 Fixing TEST post...');
  console.log(`   New scheduled time: ${scheduledTime}`);
  console.log('   Caption: テスト投稿 - メディアなし');
  console.log('   Media: [] (empty - text only)');

  const { data, error } = await supabase
    .from('posts')
    .update({
      caption: 'テスト投稿 - メディアなし',
      media: [], // 明示的に空配列
      scheduled_at: scheduledTime,
      state: 'scheduled',
      retry_count: 0,
      error_message: null,
      threads_post_id: null, // 古いIDをクリア
      permalink: null,
      published_at: null,
    })
    .eq('id', testPostId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('\n✅ TEST post fixed successfully!');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n⏰ Post will be published in ~3 minutes by cron');
}

fixTestPost().catch(console.error);
