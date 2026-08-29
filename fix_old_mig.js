const fs = require('fs');
const file = 'supabase/migrations/20260828130000_messaging_update_policy.sql';
let content = fs.readFileSync(file, 'utf8');
if(!content.includes('DROP POLICY')) {
  fs.writeFileSync(file, 'DROP POLICY IF EXISTS "Users can update their own conversation member record" ON conversation_members;\n' + content);
}
