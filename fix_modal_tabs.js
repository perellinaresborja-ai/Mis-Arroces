const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FollowsModal.tsx', 'utf8');

// 1. Change Title
code = code.replace(
  /<h2 className="text-lg font-bold">Amigos<\/h2>/,
  `{tab === 'followers' ? <h2 className="text-lg font-bold">Seguidores</h2> : <h2 className="text-lg font-bold">Siguiendo</h2>}`
);

// 2. Remove Tabs
const tabsRegex = /<div className="flex w-full px-4 border-b border-border shrink-0">[\s\S]*?<\/div>\s*<div className="overflow-y-auto/;

code = code.replace(tabsRegex, `<div className="overflow-y-auto`);

fs.writeFileSync('src/components/domain/FollowsModal.tsx', code);
console.log("REMOVED TABS");
