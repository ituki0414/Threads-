import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://quimpewkazigzruqginy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aW1wZXdrYXppZ3pydXFnaW55Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwMTEzMSwiZXhwIjoyMDc3Mzc3MTMxfQ.O_NQgq8A3aclXymZlOcNhFvVAFAwQ2v1Nk5chSVaXkU'
);

async function main() {
  const accountId = 'f7337436-c6c5-4700-ad2c-4f696feb0f22';

  // Get November posts without state filter
  const { data: novPosts, error } = await supabase
    .from('posts')
    .select('id, state, caption, scheduled_at, published_at')
    .eq('account_id', accountId)
    .gte('scheduled_at', '2025-11-01T00:00:00Z')
    .lt('scheduled_at', '2025-12-01T00:00:00Z');

  console.log(`📅 November 2025 posts (all states): ${novPosts?.length || 0}\n`);

  const byState = novPosts?.reduce((acc, p) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('States:', byState);
  console.log('');

  novPosts?.forEach((p, i) => {
    const date = new Date(p.scheduled_at!);
    console.log(`${i + 1}. [${p.state}] Day ${date.getDate()}: ${p.caption?.substring(0, 40)}`);
  });
}

main().catch(console.error);
