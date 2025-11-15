import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFailedPostEdit() {
  const testPostId = '55725e6a-68a5-490d-b08c-f63f9ec6c664';

  console.log('📋 Step 1: Current state of TEST post');
  const { data: before } = await supabase
    .from('posts')
    .select('id, caption, scheduled_at, state, retry_count, error_message')
    .eq('id', testPostId)
    .single();

  console.log(JSON.stringify(before, null, 2));

  // 5分後の時刻を設定（現在時刻+5分）
  const fiveMinutesLater = new Date(Date.now() + 5 * 60 * 1000);
  const scheduledTime = fiveMinutesLater.toISOString();

  console.log('\n📝 Step 2: Simulating edit - changing to scheduled 5 minutes from now');
  console.log(`   New scheduled_at: ${scheduledTime}`);

  const { data: updated, error } = await supabase
    .from('posts')
    .update({
      scheduled_at: scheduledTime,
      state: 'scheduled',
      retry_count: 0,
      error_message: null,
    })
    .eq('id', testPostId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating post:', error);
    return;
  }

  console.log('\n✅ Step 3: Post updated successfully');
  console.log(JSON.stringify(updated, null, 2));

  console.log('\n⏰ Step 4: Waiting for cron to publish...');
  console.log(`   Post scheduled for: ${scheduledTime}`);
  console.log(`   Cron runs every 5 minutes and publishes posts up to 5 minutes ahead`);
  console.log(`   Check the post status in the UI or run check-test-post.ts in a few minutes`);
}

testFailedPostEdit().catch(console.error);
