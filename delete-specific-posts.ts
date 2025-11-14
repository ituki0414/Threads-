import { supabaseAdmin } from './lib/supabase-admin';

async function deleteSpecificPosts() {
  // The post IDs we know have base64 media (from the earlier query)
  const badPostIds = [
    '85f3781b-f531-48e9-b6b0-09e875e86da7', // The one with the massive base64 video
  ];

  console.log(`Deleting ${badPostIds.length} posts with corrupted media...`);

  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .in('id', badPostIds);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Deleted posts successfully');
}

deleteSpecificPosts();
