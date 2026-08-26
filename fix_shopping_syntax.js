const fs = require('fs');
let content = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

const prefix = content.substring(0, content.indexOf('const getSortWeight = (name: string) => {'));
const suffix = content.substring(content.indexOf('  const formatQuantity = (qty: number | null, unitName: string | null) => {'));

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
  });

`;

fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', prefix + newSort + suffix, 'utf8');
