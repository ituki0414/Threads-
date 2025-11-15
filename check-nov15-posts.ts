import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNov15Posts() {
  console.log('=== 📅 Checking November 15, 2025 Posts ===\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'scheduled')
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Total scheduled posts: ${posts?.length || 0}\n`);

  if (posts && posts.length > 0) {
    posts.forEach(p => {
      const scheduledDate = new Date(p.scheduled_at);
      console.log(`Scheduled: ${p.scheduled_at}`);
      console.log(`  Local: ${scheduledDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
      console.log(`  Caption: ${p.caption?.substring(0, 60)}...`);
      console.log(`  ID: ${p.id}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No scheduled posts found!');
  }

  // Check for published posts on Nov 15
  const { data: publishedPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'published')
    .gte('published_at', '2025-11-15T00:00:00Z')
    .lt('published_at', '2025-11-16T00:00:00Z')
    .order('published_at', { ascending: true });

  console.log(`\n=== Published posts on November 15, 2025 ===`);
  console.log(`Count: ${publishedPosts?.length || 0}\n`);

  if (publishedPosts && publishedPosts.length > 0) {
    publishedPosts.forEach(p => {
      const pubDate = new Date(p.published_at);
      console.log(`Published: ${p.published_at}`);
      console.log(`  Local: ${pubDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
      console.log(`  Caption: ${p.caption?.substring(0, 60)}...`);
      console.log(`  ID: ${p.id}`);
      console.log('');
    });
  }
}

checkNov15Posts().catch(console.error);
