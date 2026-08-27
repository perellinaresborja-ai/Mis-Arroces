const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

if (!code.includes('NotificationBell')) {
  code = code.replace(
    /<div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">/,
    `<div className="min-h-screen bg-background flex flex-col pb-24 md:pb-8">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4">
        <div className="relative w-32 h-8">
          <Image src="/logohor.png" alt="Mis Arroces Logo" fill sizes="150px" className="object-contain object-left" priority />
        </div>
        {user && <NotificationBell />}
      </div>`
  );
  code = `import { NotificationBell } from "@/components/domain/NotificationBell";\n` + code;
  fs.writeFileSync('src/app/page.tsx', code);
}
