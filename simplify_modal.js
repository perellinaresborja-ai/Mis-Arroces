const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FollowsModal.tsx', 'utf8');

const regex = /<div className="flex flex-col">\s*<span className="font-bold text-sm">\{u\.display_name \|\| \`@\$\{u\.username\}\`\}<\/span>\s*<span className="text-xs text-muted-foreground">@\{u\.username\}<\/span>\s*<\/div>/s;

const replacement = `<div className="flex flex-col">
                            <span className="font-bold text-[15px]">{u.display_name || \`@\${u.username}\`}</span>
                          </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/domain/FollowsModal.tsx', code);
console.log("SIMPLIFIED USER INFO");
