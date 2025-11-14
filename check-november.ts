import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkNovemberPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, caption, scheduled_at, state, created_at')
    .eq('state', 'scheduled')
    .gte('scheduled_at', '2025-11-01T00:00:00Z')
    .lte('scheduled_at', '2025-11-30T23:59:59Z')
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('📅 November 2025 scheduled posts:', data?.length || 0);
  console.log('');

  if (data && data.length > 0) {
    data.forEach(post => {
      const scheduledDate = new Date(post.scheduled_at);
      console.log('---');
      console.log('ID:', post.id);
      console.log('Caption:', post.caption?.substring(0, 50) || '(no caption)');
      console.log('Scheduled (UTC):', post.scheduled_at);
      console.log('Scheduled (JST):', scheduledDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
      console.log('State:', post.state);
    });
  } else {
    console.log('❌ No scheduled posts found for November 2025');
  }
}

checkNovemberPosts();
