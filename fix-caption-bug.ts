import { supabaseAdmin } from './lib/supabase-admin';

async function fixCaptionBug() {
  console.log('=== Checking for posts with broken caption ===\n');

  // Find posts where caption starts with "Initial date loading" or contains debugging text
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, caption, state')
    .or('caption.ilike.%Initial date loading%,caption.ilike.%📅%')
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('✅ No posts found with broken captions');
    return;
  }

  console.log(`Found ${posts.length} posts with debugging text in caption:\n`);

  for (const post of posts) {
    console.log(`ID: ${post.id}`);
    console.log(`State: ${post.state}`);
    console.log(`Caption: ${post.caption?.substring(0, 100)}...`);
    console.log('---');
  }

  console.log('\nTo fix these, you need to manually edit the captions in the UI.');
  console.log('The debugging text should NOT be in the caption field.');
}

fixCaptionBug();
