const fs = require('fs');

let file = fs.readFileSync('src/app/profile/insights/ProfileInsightsView.tsx', 'utf8');

file = file.replace(
  'if (top && top.length > 0) {',
  'if (top && (top as any[]).length > 0) {'
);

file = file.replace(
  'const recipeIds = top.map((t: any) => t.entity_id)',
  'const recipeIds = (top as any[]).map((t: any) => t.entity_id)'
);

file = file.replace(
  'const hydrated = top.map((t: any) => {',
  'const hydrated = (top as any[]).map((t: any) => {'
);

fs.writeFileSync('src/app/profile/insights/ProfileInsightsView.tsx', file, 'utf8');
