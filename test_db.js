require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: convs, error } = await supabase.from('conversations').select('id, participant_hash, created_at').order('created_at', { ascending: false }).limit(5);
  console.log("Conversations:", convs, error);
  
  if (convs && convs.length > 0) {
    const { data: members, error: mErr } = await supabase.from('conversation_members').select('*').eq('conversation_id', convs[0].id);
    console.log("Members:", members, mErr);
  }
}
test();
