import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTodayPosts() {
  console.log('=== 📅 Posts Created Today (2025-11-15) ===\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .gte('created_at', '2025-11-15T00:00:00Z')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Total posts created today: ${posts?.length || 0}\n`);

  if (posts && posts.length > 0) {
    const stateCount: Record<string, number> = {};
    posts.forEach(p => {
      stateCount[p.state] = (stateCount[p.state] || 0) + 1;
    });

    console.log(`Posts by state:`, stateCount);

    // Count scheduled vs not scheduled
    const withScheduledAt = posts.filter(p => p.scheduled_at !== null);
    const withoutScheduledAt = posts.filter(p => p.scheduled_at === null);

    console.log(`\nWith scheduled_at: ${withScheduledAt.length}`);
    console.log(`Without scheduled_at: ${withoutScheduledAt.length}\n`);

    // Show first 10 posts
    console.log('First 10 posts created today:');
    posts.slice(0, 10).forEach((p, idx) => {
      console.log(`\n${idx + 1}. [${p.state}] ${p.caption?.substring(0, 60)}...`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Created: ${p.created_at}`);
      console.log(`   Scheduled: ${p.scheduled_at || 'NULL'}`);
      console.log(`   Published: ${p.published_at || 'NULL'}`);
      console.log(`   Threads ID: ${p.threads_post_id || 'NULL'}`);
    });

    // Check if there were scheduled posts that got converted
    const scheduledButPublished = posts.filter(p =>
      p.state === 'published' && p.scheduled_at !== null
    );

    if (scheduledButPublished.length > 0) {
      console.log(`\n⚠️  Found ${scheduledButPublished.length} posts that were scheduled but are now published`);
      scheduledButPublished.slice(0, 5).forEach(p => {
        console.log(`   - Scheduled: ${p.scheduled_at}, Published: ${p.published_at}`);
      });
    }
  }
}

checkTodayPosts().catch(console.error);
