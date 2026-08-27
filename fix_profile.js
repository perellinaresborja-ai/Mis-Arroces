const fs = require('fs');
let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

if (!code.includes('Mensaje')) {
  code = code.replace(/<div className="mt-5">/, 
  `<div className="mt-5 flex justify-center items-center gap-2">
                <a href={\`/messages?to=\${profile.id}\`} className="inline-flex items-center justify-center rounded-full text-sm font-bold border border-border bg-card hover:bg-muted h-10 px-4 shadow-sm">
                  <MessageCircle className="w-4 h-4 mr-2"/> Mensaje
                </a>`);

  if (!code.includes('MessageCircle')) {
    code = code.replace(/import \{([^}]+)\} from "lucide-react"/, (m, p1) => `import { ${p1}, MessageCircle } from "lucide-react"`);
  }

  fs.writeFileSync('src/app/[userParam]/page.tsx', code);
  console.log('Injected button');
} else {
  console.log('Already there');
}
