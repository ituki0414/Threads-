import { supabaseAdmin } from './lib/supabase-admin';

async function cleanupBadPosts() {
  console.log('=== Cleaning up posts with base64 media data ===\n');

  // Find posts where media contains base64 data
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('state', 'scheduled');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('No scheduled posts found');
    return;
  }

  const badPosts = posts.filter(post => {
    if (!post.media || post.media.length === 0) return false;
    const firstMedia = post.media[0];
    return typeof firstMedia === 'string' && firstMedia.startsWith('data:');
  });

  if (badPosts.length === 0) {
    console.log('✅ No posts with base64 media found');
    return;
  }

  console.log(`Found ${badPosts.length} posts with base64 media data:\n`);

  for (const post of badPosts) {
    console.log(`ID: ${post.id}`);
    console.log(`Caption: ${post.caption?.substring(0, 50)}...`);
    console.log(`Scheduled: ${post.scheduled_at}`);
    console.log(`Media size: ${JSON.stringify(post.media[0]).length} bytes`);
  }

  console.log('\n⚠️  These posts should be deleted as they contain invalid media data.');
  console.log('Delete them? (Run with DELETE_POSTS=true to confirm)\n');

  if (process.env.DELETE_POSTS === 'true') {
    console.log('Deleting bad posts...');

    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .in('id', badPosts.map(p => p.id));

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return;
    }

    console.log(`✅ Deleted ${badPosts.length} posts`);
  }
}

cleanupBadPosts();
