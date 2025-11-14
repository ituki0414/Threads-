import { supabaseAdmin } from './lib/supabase-admin';

async function checkRecentPosts() {
  console.log('=== Recent scheduled posts (by ID only) ===\n');

  // IDとステートだけ取得して、メディアデータは取得しない
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, state, caption, scheduled_at, created_at')
    .eq('state', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${posts?.length || 0} scheduled posts\n`);

  if (!posts || posts.length === 0) {
    console.log('⚠️  No scheduled posts found - they may have been deleted');

    // Check if any posts were recently deleted
    console.log('\nChecking total post count...');
    const { count, error: countError } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`Total posts in database: ${count}`);
    }
    return;
  }

  for (const post of posts) {
    console.log(`ID: ${post.id}`);
    console.log(`Caption: ${post.caption?.substring(0, 60)}...`);
    console.log(`Scheduled: ${post.scheduled_at}`);
    console.log(`Created: ${post.created_at}`);
    console.log('---\n');
  }
}

checkRecentPosts();
