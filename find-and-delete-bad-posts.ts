import { supabaseAdmin } from './lib/supabase-admin';

async function findAndDeleteBadPosts() {
  console.log('=== Finding posts with large media data ===\n');

  // Get all post IDs without fetching media
  const { data: postIds, error: idError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .order('created_at', { ascending: false });

  if (idError) {
    console.error('❌ Error fetching post IDs:', idError);
    return;
  }

  console.log(`Found ${postIds?.length || 0} total posts. Checking each for bad media...`);

  const badPostIds: string[] = [];

  // Check each post individually
  for (const { id } of postIds || []) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('media')
        .eq('id', id)
        .single()
        .abortSignal(AbortSignal.timeout(2000)); // 2 second timeout

      if (error) {
        if (error.message.includes('timeout')) {
          console.log(`❌ Timeout on post ${id} - likely has huge media data`);
          badPostIds.push(id);
        }
        continue;
      }

      // Check if media contains base64 data
      if (data?.media && Array.isArray(data.media) && data.media.length > 0) {
        const firstMedia = data.media[0];
        if (typeof firstMedia === 'string' && firstMedia.startsWith('data:')) {
          console.log(`❌ Found base64 media in post ${id}`);
          badPostIds.push(id);
        }
      }
    } catch (err: any) {
      if (err.message?.includes('timeout') || err.name === 'AbortError') {
        console.log(`❌ Timeout on post ${id} - likely has huge media data`);
        badPostIds.push(id);
      }
    }
  }

  if (badPostIds.length === 0) {
    console.log('\n✅ No posts with bad media found!');
    return;
  }

  console.log(`\n⚠️  Found ${badPostIds.length} posts with bad media:`);
  console.log(badPostIds);

  console.log('\nDeleting bad posts...');

  const { error: deleteError } = await supabaseAdmin
    .from('posts')
    .delete()
    .in('id', badPostIds);

  if (deleteError) {
    console.error('❌ Delete error:', deleteError);
    return;
  }

  console.log(`✅ Deleted ${badPostIds.length} posts with bad media`);
}

findAndDeleteBadPosts();
