import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markAsFailed() {
  const { data, error} = await supabase
    .from('posts')
    .update({
      state: 'failed',
      retry_count: 1
    })
    .eq('id', '55725e6a-68a5-490d-b08c-f63f9ec6c664')
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('✅ Successfully marked TEST post as failed');
  console.log('New state:', data?.[0]?.state);
}

markAsFailed().catch(console.error);
