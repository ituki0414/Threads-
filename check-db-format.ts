import { supabase } from './lib/supabase';

async function checkDatabaseFormat() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, scheduled_at, created_at')
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Database values:');
  data?.forEach(post => {
    console.log(`Post ${post.id}:`);
    console.log('  scheduled_at:', post.scheduled_at, typeof post.scheduled_at);
    console.log('  created_at:', post.created_at, typeof post.created_at);
    if (post.scheduled_at) {
      const parsed = new Date(post.scheduled_at);
      console.log('  Parsed Date:', parsed);
      console.log('  ISO:', parsed.toISOString());
    }
  });
}

checkDatabaseFormat();
