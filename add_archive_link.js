const fs = require('fs');
let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

code = code.replace(
  /<Link href="\/settings"/,
  `<Link href="/profile/story-archive" className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-full hover:bg-black transition text-white backdrop-blur-sm shadow-sm" title="Archivo"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg></Link>\n                <Link href="/settings"`
);

fs.writeFileSync('src/app/[userParam]/page.tsx', code);
