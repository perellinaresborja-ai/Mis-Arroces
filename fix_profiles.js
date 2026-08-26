const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').update({ onboarding_completed: true }).eq('onboarding_completed', false);
  console.log('Updated false to true:', error ? error : 'Success');
  
  const { data: d2, error: e2 } = await supabase.from('profiles').update({ onboarding_completed: true }).is('onboarding_completed', null);
  console.log('Updated null to true:', e2 ? e2 : 'Success');
}
run();
