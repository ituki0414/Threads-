import { createClient } from '@supabase/supabase-js';

// This is the exact query from calendar/page.tsx
const supabase = createClient(
  'https://quimpewkazigzruqginy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aW1wZXdrYXppZ3pydXFnaW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDExMzEsImV4cCI6MjA3NzM3NzEzMX0.mM7Z_vDUEYELVvUu2ROvaFlSkOVB6kw2_aQM4V8kAEE'
);

async function main() {
  const accountId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Testing EXACT calendar query from page.tsx...\n');

  // Exact query from calendar/page.tsx line 66-72
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

  // Filter for November 14-15
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
    nov14_15Posts.forEach((p, i) => {
      const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
      const date = new Date(dateStr!);
      console.log(`${i + 1}. [${p.state}] Day ${date.getDate()}: ${p.caption?.substring(0, 40)}`);
    });
  } else {
    console.log('⚠️ No November 14-15 posts found in calendar query result!');
  }

  // Check if there are any scheduled posts at all
  const scheduledPosts = data?.filter(p => p.state === 'scheduled');
  console.log(`\n📊 Total scheduled posts in query result: ${scheduledPosts?.length || 0}`);
}

main().catch(console.error);
