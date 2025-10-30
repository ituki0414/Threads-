import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestPost() {
  console.log('🔍 Checking for post ID: 18125866432500665');

  const { data: specificPost, error: specificError } = await supabase
    .from('posts')
    .select('*')
    .eq('threads_post_id', '18125866432500665')
    .single();

  if (specificError) {
    console.log('❌ Specific post not found:', specificError.message);
  } else {
    console.log('✅ Found specific post:', {
      id: specificPost.id,
      threads_post_id: specificPost.threads_post_id,
      caption: specificPost.caption?.substring(0, 50),
      state: specificPost.state,
      published_at: specificPost.published_at,
      scheduled_at: specificPost.scheduled_at,
    });
  }

  console.log('\n📊 Getting all published posts count:');
  const { data: allPosts, error: allError } = await supabase
    .from('posts')
    .select('*')
    .eq('state', 'published')
    .order('published_at', { ascending: false })
    .limit(5);

  if (allError) {
    console.log('❌ Error fetching all posts:', allError.message);
  } else {
    console.log(`✅ Total published posts fetched: ${allPosts?.length || 0}`);
    console.log('📅 Latest 5 posts:');
    allPosts?.forEach((post, i) => {
      console.log(`  ${i + 1}. ID: ${post.threads_post_id}, Caption: ${post.caption?.substring(0, 40)}, Published: ${post.published_at}`);
    });
  }
}

checkLatestPost();
