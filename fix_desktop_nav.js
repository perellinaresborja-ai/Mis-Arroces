const fs = require('fs');
let c = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

if (!c.includes('GlobalCreateMenu')) {
  c = c.replace(
    'import { NotificationBell } from "@/components/domain/NotificationBell"',
    'import { NotificationBell } from "@/components/domain/NotificationBell"\nimport { GlobalCreateMenu } from "@/components/domain/GlobalCreateMenu"'
  );
  
  c = c.replace(
    '<NotificationBell />',
    '<GlobalCreateMenu />\n            <NotificationBell />'
  );
  
  fs.writeFileSync('src/components/domain/DesktopNav.tsx', c);
}
