import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkCalendarData() {
  console.log('🔍 Checking calendar data...\n');

  // Get account ID
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, handle')
    .limit(1);

  if (!accounts || accounts.length === 0) {
    console.log('❌ No accounts found');
    return;
  }

  const accountId = accounts[0].id;
  console.log(`📱 Using account: ${accounts[0].handle} (${accountId})\n`);

  // Fetch exactly the same way as calendar page
  const { data, error } = await supabase
    .from('posts')
    .select('id, account_id, threads_post_id, state, caption, published_at, scheduled_at, slot_quality, created_at')
    .eq('account_id', accountId)
    .in('state', ['scheduled', 'published'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(10000);

  if (error) {
    console.error('❌ Error fetching posts:', error);
    return;
  }

  console.log(`✅ Total posts fetched: ${data?.length || 0}\n`);

  // Filter for November 14-15, 2025
  const nov14_15Posts = data?.filter(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const isNov = date.getMonth() === 10; // November is month 10
    const is14or15 = date.getDate() === 14 || date.getDate() === 15;
    const is2025 = date.getFullYear() === 2025;
    return isNov && is14or15 && is2025;
  });

  console.log(`📅 November 14-15, 2025 posts: ${nov14_15Posts?.length || 0}\n`);

  if (nov14_15Posts && nov14_15Posts.length > 0) {
    console.log('Posts details:');
    nov14_15Posts.forEach((p, i) => {
      const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
      const date = new Date(dateStr!);
      console.log(`\n${i + 1}. Post ID: ${p.id.substring(0, 8)}...`);
      console.log(`   State: ${p.state}`);
      console.log(`   Date: ${date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
      console.log(`   Caption: ${p.caption?.substring(0, 50) || '(no caption)'}...`);
      console.log(`   scheduled_at: ${p.scheduled_at}`);
      console.log(`   published_at: ${p.published_at}`);
    });
  } else {
    console.log('⚠️ No posts found for November 14-15, 2025');
  }

  // Check all November posts
  const allNovPosts = data?.filter(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getMonth() === 10 && date.getFullYear() === 2025;
  });

  console.log(`\n📊 All November 2025 posts: ${allNovPosts?.length || 0}`);
  if (allNovPosts && allNovPosts.length > 0) {
    const dateBreakdown = allNovPosts.reduce((acc, p) => {
      const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
      const date = new Date(dateStr!);
      const day = date.getDate();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('\nPosts by day:');
    Object.entries(dateBreakdown).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([day, count]) => {
      console.log(`  Nov ${day}: ${count} posts`);
    });
  }
}

checkCalendarData().catch(console.error);
