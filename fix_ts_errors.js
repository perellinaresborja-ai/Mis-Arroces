const fs = require('fs');

const fixFile = (path) => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/account_type:\s*['"]USER['"]/g, "account_type: 'PERSONAL'");
    fs.writeFileSync(path, content, 'utf8');
  }
}

fixFile('src/app/auth/callback/route.ts');
fixFile('src/app/login/actions.ts');
