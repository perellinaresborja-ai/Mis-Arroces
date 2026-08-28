const fs = require('fs');

let page = fs.readFileSync('src/app/invite/[code]/page.tsx', 'utf8');

// Remove cookieStore logic
page = page.replace(
  /const cookieStore = await cookies\(\)\n\s*cookieStore\.set\("misarroces_invite_code", code, \{ maxAge: 60 \* 60 \* 24 \* 7 \}\) \/\/ 7 days/,
  `// Set cookie client-side to avoid Next.js Server Component cookie mutation error`
);

// Add import for SetInviteCookie
if (!page.includes('SetInviteCookie')) {
  page = page.replace(
    /import \{ cookies \} from "next\/headers"/,
    `import { cookies } from "next/headers"\nimport { SetInviteCookie } from "./SetInviteCookie"`
  );
}

// Add the component to the return JSX
page = page.replace(
  /<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">/,
  `<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">\n      <SetInviteCookie code={code} />`
);

fs.writeFileSync('src/app/invite/[code]/page.tsx', page);
console.log("FIXED INVITE PAGE COOKIE");
