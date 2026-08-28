const fs = require('fs');
let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

code = code.replace(
  /<ProfileGridCard\s*\n\s*key=\{\`\$\{item\.entity_type\}-\$\{item\.id\}\`\}\s*\n\s*item=\{item\}\s*\n\s*\/>/g,
  `<ProfileGridCard \n                    key={\`\${item.entity_type}-\${item.id}\`} \n                    item={item} \n                    currentUserId={user?.id || null}\n                  />`
);

fs.writeFileSync('src/app/[userParam]/page.tsx', code);
console.log("FIXED PROFILE PAGE PROPS");
