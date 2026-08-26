require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase.from('profiles').select('account_type, professional_type');
  if (error) {
    console.error(error);
    return;
  }
  
  const counts = {};
  data.forEach(p => {
    const key = `${p.account_type} - ${p.professional_type}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  console.log('User counts by type:');
  console.log(counts);
}

checkUsers();
