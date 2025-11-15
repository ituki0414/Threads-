import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markAsFailed() {
  const { data, error } = await supabase
    .from('posts')
    .update({
      state: 'failed',
      error_message: '永続的エラー: Failed to publish post: {"error":{"message":"The requested resource does not exist","type":"OAuthException","code":24}}',
      retry_count: 1
    })
    .eq('id', '55725e6a-68a5-490d-b08c-f63f9ec6c664')
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('✅ Successfully marked TEST post as failed');
  console.log('Updated:', data);
}

markAsFailed().catch(console.error);
