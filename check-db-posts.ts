import { supabase } from './lib/supabase';
import { parseDateFromDatabase } from './lib/datetime-utils';

async function checkPosts() {
  console.log('=== Fetching scheduled posts from database ===\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, caption, scheduled_at, created_at, state')
    .eq('state', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('No scheduled posts found');
    return;
  }

  posts.forEach((post, idx) => {
    console.log(`\n--- Post ${idx + 1} (ID: ${post.id}) ---`);
    console.log('Caption preview:', post.caption?.substring(0, 80) + '...');
    console.log('scheduled_at (raw):', post.scheduled_at);
    console.log('scheduled_at (type):', typeof post.scheduled_at);

    if (post.scheduled_at) {
      // Test parsing
      const parsed = parseDateFromDatabase(post.scheduled_at);
      console.log('Parsed components:', {
        year: parsed.getFullYear(),
        month: parsed.getMonth() + 1,
        day: parsed.getDate(),
        hours: parsed.getHours(),
        minutes: parsed.getMinutes(),
      });

      // Test with native Date constructor
      const nativeParsed = new Date(post.scheduled_at);
      console.log('Native Date parse:', nativeParsed.toString());
      console.log('Native components:', {
        year: nativeParsed.getFullYear(),
        month: nativeParsed.getMonth() + 1,
        day: nativeParsed.getDate(),
        hours: nativeParsed.getHours(),
        minutes: nativeParsed.getMinutes(),
      });
    }
  });
}

checkPosts();
