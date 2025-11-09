import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLimit() {
  const accId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Checking if there is a row limit...\n');

  // Get ALL published posts
  const { data: allPublished, error } = await supabase
    .from('posts')
    .select('id, published_at, state')
    .eq('account_id', accId)
    .eq('state', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total published posts: ${allPublished?.length}`);

  // Count by month
  const byMonth: { [month: string]: number } = {};
  allPublished?.forEach(p => {
    if (p.published_at) {
      const date = new Date(p.published_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    }
  });

  console.log('\n📊 Posts by month (all published):');
  Object.entries(byMonth)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 10)
    .forEach(([month, count]) => {
      console.log(`  ${month}: ${count} posts`);
    });

  // Now check with the calendar query (without explicit limit)
  const { data: calendarQuery, error: error2 } = await supabase
    .from('posts')
    .select('id, published_at, scheduled_at, state')
    .eq('account_id', accId)
    .in('state', ['scheduled', 'published']);

  console.log(`\n📊 Calendar query result: ${calendarQuery?.length} posts`);

  // Check if it's exactly 1000 (default Supabase limit)
  if (calendarQuery?.length === 1000) {
    console.log('⚠️ WARNING: Result is exactly 1000 - this is the default Supabase limit!');
    console.log('   Calendar is only showing the FIRST 1000 posts, not all posts!');
  }

  // Get the date range of those 1000 posts
  const dates = calendarQuery?.map(p => p.published_at || p.scheduled_at).filter(Boolean);
  if (dates && dates.length > 0) {
    const sorted = dates.sort();
    console.log(`\n📅 Date range of calendar query (1000 posts):`);
    console.log(`   Oldest: ${sorted[0]}`);
    console.log(`   Newest: ${sorted[sorted.length - 1]}`);
  }

  console.log('\n💡 Solution: Add .limit(10000) to the calendar query to fetch more posts');
}

checkLimit();
