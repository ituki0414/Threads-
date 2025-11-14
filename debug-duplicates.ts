import { supabaseAdmin } from './lib/supabase-admin';

async function debugDuplicates() {
  console.log('=== Checking for duplicate posts ===\n');

  // Get all scheduled posts with their details
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('state', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('No scheduled posts found');
    return;
  }

  console.log(`Found ${posts.length} scheduled posts:\n`);

  for (const post of posts) {
    console.log(`ID: ${post.id}`);
    console.log(`Caption: ${post.caption?.substring(0, 50)}...`);
    console.log(`Media: ${JSON.stringify(post.media)}`);
    console.log(`Scheduled: ${post.scheduled_at}`);
    console.log(`Created: ${post.created_at}`);
    console.log('---\n');
  }

  // Find potential duplicates (same caption, scheduled_at, and media)
  const duplicateGroups: { [key: string]: typeof posts } = {};

  for (const post of posts) {
    const key = `${post.caption}_${post.scheduled_at}_${JSON.stringify(post.media)}`;
    if (!duplicateGroups[key]) {
      duplicateGroups[key] = [];
    }
    duplicateGroups[key].push(post);
  }

  const actualDuplicates = Object.values(duplicateGroups).filter(group => group.length > 1);

  if (actualDuplicates.length > 0) {
    console.log('\n=== DUPLICATES FOUND ===\n');
    for (const group of actualDuplicates) {
      console.log(`Duplicate group (${group.length} posts):`);
      for (const post of group) {
        console.log(`  - ID: ${post.id}, Created: ${post.created_at}`);
      }
      console.log(`  Caption: ${group[0].caption?.substring(0, 50)}`);
      console.log(`  Scheduled: ${group[0].scheduled_at}`);
      console.log('---\n');
    }
  } else {
    console.log('\n✅ No exact duplicates found');
  }
}

debugDuplicates();
