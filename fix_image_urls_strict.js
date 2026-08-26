const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (fullPath.includes('client.ts') || fullPath.includes('server.ts') || fullPath.includes('middleware.ts')) continue;

      if (content.includes('(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvesoygqssyyojqyswwm.supabase.co")')) {
        content = content.replace(/\(process\.env\.NEXT_PUBLIC_SUPABASE_URL \|\| "https:\/\/zvesoygqssyyojqyswwm\.supabase\.co"\)/g, '"https://zvesoygqssyyojqyswwm.supabase.co"');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

replaceInDir('src');
console.log('Done hardcoding image urls');
