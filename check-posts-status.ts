import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://quimpewkazigzruqginy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aW1wZXdrYXppZ3pydXFnaW55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwMTEzMSwiZXhwIjoyMDc3Mzc3MTMxfQ.O_NQgq8A3aclXymZlOcNhFvVAFAwQ2v1Nk5chSVaXkU'
);

async function checkPosts() {
  const accountId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  console.log('🔍 Checking all posts...\n');

  const { data: allPosts, error } = await supabase
    .from('posts')
    .select('id, state, caption, scheduled_at, published_at, created_at')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Total posts found: ${allPosts?.length || 0}\n`);

  const byState = allPosts?.reduce((acc, p) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Posts by state:', byState);
  console.log('\nRecent posts:');

  allPosts?.slice(0, 10).forEach((p, i) => {
    console.log(`\n${i + 1}. [${p.state}] ${p.caption?.substring(0, 40)}...`);
    console.log(`   Created: ${p.created_at}`);
    console.log(`   Scheduled: ${p.scheduled_at || 'N/A'}`);
    console.log(`   Published: ${p.published_at || 'N/A'}`);
  });
}

checkPosts().catch(console.error);
