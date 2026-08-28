const fs = require('fs');

let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// 1. Extract the "Arroceros que descubrir" section
const usersSectionRegex = /<section className="mt-8">\s*<div className="flex items-center justify-between mb-4">\s*<h2 className="text-xl font-bold">Arroceros que descubrir[\s\S]*?<\/section>/g;

const match = usersSectionRegex.exec(code);
if (match) {
  const usersSection = match[0];
  
  // Remove it from its original place
  code = code.replace(usersSection, "");
  
  // Clean up its classes to remove mt-8 if we put it at top
  const newUsersSection = usersSection.replace('<section className="mt-8">', '<section>');
  
  // Insert it before Quick Chips
  const anchor = '{/* Quick Chips Concept */}';
  code = code.replace(anchor, newUsersSection + '\n\n          ' + anchor);
}

// 2. Fix the Últimos arroces bug
code = code.replace(
  '{homeData.popular.map((r) => { // FIXME',
  '{homeData.recent.map((r) => {'
);
// Or if there is no FIXME:
code = code.replace(
  /<h2 className="text-xl font-bold">Últimos arroces<\/h2>[\s\S]*?\{homeData\.popular\.map/g,
  '<h2 className="text-xl font-bold">Últimos arroces</h2>\n              <Link href="/discover?tab=arroces" className="text-sm font-semibold text-primary hover:underline">Ver todos &gt;</Link>\n            </div>\n            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">\n              {homeData.recent.map'
);


fs.writeFileSync('src/app/discover/page.tsx', code);
