const fs = require('fs');

let file = fs.readFileSync('src/components/domain/EscandalloSection.tsx', 'utf8');

if (!file.includes('formatUnitSymbol')) {
  file = file.replace(
    'import { createClient } from "@/lib/supabase/client"',
    'import { createClient } from "@/lib/supabase/client"\nimport { formatUnitSymbol } from "@/lib/utils"'
  );
}

file = file.replace(
  '{usedUnit?.name}</p>',
  '{formatUnitSymbol(usedUnit?.name)}</p>'
);

file = file.replace(
  '<option key={u.id} value={u.id}>{u.name}</option>',
  '<option key={u.id} value={u.id}>{formatUnitSymbol(u.name)}</option>'
);

fs.writeFileSync('src/components/domain/EscandalloSection.tsx', file, 'utf8');
