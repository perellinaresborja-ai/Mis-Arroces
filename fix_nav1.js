const fs = require('fs');
let file = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

if (!file.includes('NotificationBell')) {
  file = file.replace(
    'import { buttonVariants } from "@/components/ui/button"',
    'import { buttonVariants } from "@/components/ui/button"\nimport { NotificationBell } from "@/components/domain/NotificationBell"'
  );

  const injectPoint = /<\/nav>\n      <\/div>/;
  file = file.replace(injectPoint, `  <NotificationBell />\n        </nav>\n      </div>`);

  fs.writeFileSync('src/components/domain/DesktopNav.tsx', file, 'utf8');
}
