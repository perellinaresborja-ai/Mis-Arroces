const fs = require('fs');
let code = fs.readFileSync('src/app/messages/page.tsx', 'utf8');

code = code.replace(/} catch \(err: any\) \{[^}]+/, 
`} catch (err) {
      const e = err as Error & { digest?: string };
      if (e?.message === 'NEXT_REDIRECT' || e?.digest?.startsWith('NEXT_REDIRECT')) throw err;`);

fs.writeFileSync('src/app/messages/page.tsx', code);
