import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPreciseScheduling() {
  const testPostId = '55725e6a-68a5-490d-b08c-f63f9ec6c664';

  // 2分後の正確な時刻を設定（秒単位まで指定）
  const now = new Date();
  const twoMinutesLater = new Date(now.getTime() + 2 * 60 * 1000);

  // 秒を30秒に設定（例: 12:34:30）
  twoMinutesLater.setSeconds(30);
  twoMinutesLater.setMilliseconds(0);

  const scheduledTime = twoMinutesLater.toISOString();

  console.log('⏰ Precise Scheduling Test');
  console.log('========================');
  console.log(`Current time: ${now.toISOString()}`);
  console.log(`Scheduled time: ${scheduledTime}`);
  console.log(`Expected publish: Within 1 minute of scheduled time`);
  console.log('');

  const { data, error } = await supabase
    .from('posts')
    .update({
      caption: '⏰ 精密スケジューリングテスト - 1分以内に投稿されるはずです',
      media: [],
      scheduled_at: scheduledTime,
      state: 'scheduled',
      retry_count: 0,
      error_message: null,
      threads_post_id: null,
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

  console.log('✅ Test post scheduled successfully!');
  console.log('');
  console.log('📋 Post details:');
  console.log(`   ID: ${data.id}`);
  console.log(`   Caption: ${data.caption}`);
  console.log(`   Scheduled: ${data.scheduled_at}`);
  console.log(`   State: ${data.state}`);
  console.log('');
  console.log('⏳ Next steps:');
  console.log('   1. Cron will run every minute');
  console.log('   2. Post will be published within 1 minute of scheduled time');
  console.log('   3. Check post status with: npx tsx check-test-post.ts');
  console.log('');
  console.log('📊 Expected timeline:');
  const cronRunTime1 = new Date(Math.ceil(twoMinutesLater.getTime() / 60000) * 60000);
  const cronRunTime2 = new Date(cronRunTime1.getTime() + 60000);
  console.log(`   Scheduled: ${twoMinutesLater.toLocaleTimeString('ja-JP')}`);
  console.log(`   Cron run 1: ${cronRunTime1.toLocaleTimeString('ja-JP')}`);
  console.log(`   Cron run 2: ${cronRunTime2.toLocaleTimeString('ja-JP')}`);
  console.log(`   Post should publish during one of these cron runs`);
}

testPreciseScheduling().catch(console.error);
