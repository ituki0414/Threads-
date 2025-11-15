import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteTestPost() {
  const testPostId = 'fca4e8b6-3ec9-418f-b0f9-91da792ffd64';

  console.log('🗑️  Deleting TEST post...');
  console.log(`   ID: ${testPostId}`);

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', testPostId);

  if (error) {
    console.error('❌ Error deleting post:', error);
    return;
  }

  console.log('✅ TEST post deleted successfully!');
  console.log('\n📊 Verifying deletion...');

  const { data } = await supabase
    .from('posts')
    .select('id')
    .eq('id', testPostId);

  if (!data || data.length === 0) {
    console.log('✅ Confirmed: Post no longer exists in database');
  } else {
    console.log('⚠️  Warning: Post still exists');
  }
}

deleteTestPost().catch(console.error);
