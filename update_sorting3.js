const fs = require('fs');
let content = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

const regex = /const pending = [\s\S]*?Date\(b\.created_at\)\.getTime\(\)/;

const newSort = `const getSortWeight = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes('arroz')) return 0;
    if (n.includes('caldo')) return 1;
    return 2;
  };

  const pending = items.filter(i => !i.is_checked).sort((a, b) => {
    const wA = getSortWeight(a.ingredient_name);
    const wB = getSortWeight(b.ingredient_name);
    if (wA !== wB) return wA - wB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  const checked = items.filter(i => i.is_checked).sort((a, b) => {
    const wA = getSortWeight(a.ingredient_name);
    const wB = getSortWeight(b.ingredient_name);
    if (wA !== wB) return wA - wB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })`;

content = content.replace(regex, newSort);

fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', content, 'utf8');
