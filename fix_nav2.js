const fs = require('fs');
let file = fs.readFileSync('src/components/domain/BottomNav.tsx', 'utf8');

if (!file.includes('NotificationBell')) {
  file = file.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport { NotificationBell } from "@/components/domain/NotificationBell";'
  );

  const injectPoint = /<\/nav>/;
  file = file.replace(
    /<\/div>\n    <\/nav>/,
    `      <NotificationBell className="flex flex-col items-center justify-center pt-2" />\n      </div>\n    </nav>`
  );

  fs.writeFileSync('src/components/domain/BottomNav.tsx', file, 'utf8');
}
