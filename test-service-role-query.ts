import { createClient } from '@supabase/supabase-js';

// Test with SERVICE ROLE KEY (bypasses RLS)
const supabase = createClient(
  'https://quimpewkazigzruqginy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aW1wZXdrYXppZ3pydXFnaW55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwMTEzMSwiZXhwIjoyMDc3Mzc3MTMxfQ.O_NQgq8A3aclXymZlOcNhFvVAFAwQ2v1Nk5chSVaXkU'
);

async function main() {
  const accountId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Testing with SERVICE ROLE KEY (bypasses RLS)...\n');

  const { data, error } = await supabase
    .from('posts')
    .select('id, account_id, threads_post_id, state, caption, published_at, scheduled_at, slot_quality, created_at')
    .eq('account_id', accountId)
    .in('state', ['scheduled', 'published'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(10000);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Total posts returned: ${data?.length || 0}\n`);

  const scheduledPosts = data?.filter(p => p.state === 'scheduled');
  console.log(`📊 Scheduled posts: ${scheduledPosts?.length || 0}`);

  const nov14_15Scheduled = scheduledPosts?.filter(p => {
    if (!p.scheduled_at) return false;
    const date = new Date(p.scheduled_at);
    const isNov = date.getMonth() === 10;
    const is14or15 = date.getDate() === 14 || date.getDate() === 15;
    const is2025 = date.getFullYear() === 2025;
    return isNov && is14or15 && is2025;
  });

  console.log(`📅 November 14-15 scheduled posts: ${nov14_15Scheduled?.length || 0}\n`);

  if (nov14_15Scheduled && nov14_15Scheduled.length > 0) {
    nov14_15Scheduled.forEach((p, i) => {
      const date = new Date(p.scheduled_at!);
      console.log(`${i + 1}. Day ${date.getDate()}: ${p.caption?.substring(0, 40)}`);
    });
  }
}

main().catch(console.error);
