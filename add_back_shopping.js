const fs = require('fs');

let code = fs.readFileSync('src/app/shopping-list/page.tsx', 'utf8');
if (!code.includes('BackButton')) {
  code = 'import { BackButton } from "@/components/domain/BackButton"\n' + code;
  code = code.replace(/<h1 className="text-2xl font-bold mb-6">Mi lista de compra<\/h1>/, '<div className="flex items-center mb-6 -ml-2"><BackButton /><h1 className="text-2xl font-bold ml-2">Mi lista de compra</h1></div>');
  fs.writeFileSync('src/app/shopping-list/page.tsx', code);
}

console.log('Added back button to shopping list');
