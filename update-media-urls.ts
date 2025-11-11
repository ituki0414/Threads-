import { createClient } from '@supabase/supabase-js';
import { ThreadsAPIClient } from './lib/threads-api';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateMediaUrls() {
  console.log('🔄 Updating media URLs for all posts...\n');

  // Get account
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', 'f7337436-c6c5-4700-ad2c-4f696feb0f22')
    .single();

  if (!account) {
    console.error('❌ Account not found');
    return;
  }

  console.log(`✅ Found account: ${account.threads_username}\n`);

  // Get posts from Threads API
  const threadsClient = new ThreadsAPIClient(account.access_token);
  const threadsPosts = await threadsClient.getPosts();

  console.log(`📥 Fetched ${threadsPosts.length} posts from Threads API\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const threadsPost of threadsPosts) {
    // Extract media URLs
    const mediaUrls: string[] = [];

    if (threadsPost.media_type === 'CAROUSEL_ALBUM' && threadsPost.children?.data) {
      for (const child of threadsPost.children.data) {
        if (child.media_type === 'VIDEO' && child.thumbnail_url) {
          mediaUrls.push(child.thumbnail_url);
        } else if (child.media_url) {
          mediaUrls.push(child.media_url);
        }
      }
    } else {
      if (threadsPost.media_type === 'VIDEO' && threadsPost.thumbnail_url) {
        mediaUrls.push(threadsPost.thumbnail_url);
      } else if (threadsPost.media_url) {
        mediaUrls.push(threadsPost.media_url);
      }
    }

    // Skip if no media
    if (mediaUrls.length === 0) {
      skippedCount++;
      continue;
    }

    // Update in database
    const { error } = await supabase
      .from('posts')
      .update({ media: mediaUrls })
      .eq('threads_post_id', threadsPost.id)
      .eq('account_id', account.id);

    if (error) {
      console.error(`❌ Failed to update ${threadsPost.id}:`, error.message);
    } else {
      updatedCount++;
      console.log(`✅ Updated ${threadsPost.id} (${mediaUrls.length} media)`);
    }
  }

  console.log(`\n✨ Update complete!`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped (no media): ${skippedCount}`);
  console.log(`   Total: ${threadsPosts.length}`);
}

updateMediaUrls();
