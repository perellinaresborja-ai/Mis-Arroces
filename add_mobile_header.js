const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!c.includes('MobileHeader')) {
  c = c.replace(
    'import { DesktopNav } from "@/components/domain/DesktopNav";',
    'import { DesktopNav } from "@/components/domain/DesktopNav";\nimport { MobileHeader } from "@/components/domain/MobileHeader";'
  );
  
  c = c.replace(
    '{/* Desktop Header */}\n          <DesktopNav />',
    '{/* Desktop Header */}\n          <DesktopNav />\n          {/* Mobile Header */}\n          <MobileHeader />'
  );
  
  fs.writeFileSync('src/app/layout.tsx', c);
}
