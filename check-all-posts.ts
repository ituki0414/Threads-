import { supabaseAdmin } from './lib/supabase-admin';

async function checkAllPosts() {
  console.log('=== All posts in database ===\n');

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Total posts: ${posts?.length || 0}\n`);

  if (!posts || posts.length === 0) {
    console.log('No posts found');
    return;
  }

  const scheduled = posts.filter(p => p.state === 'scheduled');
  const published = posts.filter(p => p.state === 'published');
  const draft = posts.filter(p => p.state === 'draft');

  console.log(`Scheduled: ${scheduled.length}`);
  console.log(`Published: ${published.length}`);
  console.log(`Draft: ${draft.length}\n`);

  console.log('=== Scheduled posts ===\n');
  for (const post of scheduled) {
    console.log(`ID: ${post.id}`);
    console.log(`Caption: ${post.caption?.substring(0, 60)}...`);
    console.log(`Scheduled: ${post.scheduled_at}`);
    console.log(`Created: ${post.created_at}`);
    console.log('---\n');
  }
}

checkAllPosts();
