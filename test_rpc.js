require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  // Login as one user to test RPC
  const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@misarroces.es', // guessing, or I can just use service role
    password: 'password'
  });
}
