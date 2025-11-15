import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTestPost() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', '55725e6a-68a5-490d-b08c-f63f9ec6c664')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('TEST Post Details:');
  console.log('ID:', data.id);
  console.log('Caption:', data.caption);
  console.log('Media:', JSON.stringify(data.media, null, 2));
  console.log('Scheduled:', data.scheduled_at);
  console.log('State:', data.state);
  console.log('Error Message:', data.error_message);
}

checkTestPost().catch(console.error);
