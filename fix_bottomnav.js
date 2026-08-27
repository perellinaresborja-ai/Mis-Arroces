const fs = require('fs');

let bottomCode = fs.readFileSync('src/components/domain/BottomNav.tsx', 'utf8');

if (!bottomCode.includes('import { UnreadBadge }')) {
  bottomCode = bottomCode.replace(/"use client"\s*/, `"use client"\nimport { UnreadBadge } from "@/components/domain/messages/UnreadBadge";\n`);
  fs.writeFileSync('src/components/domain/BottomNav.tsx', bottomCode);
}

// Let's also verify DesktopNav.tsx just in case
let desktopCode = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');
if (!desktopCode.includes('import { UnreadBadge }')) {
  desktopCode = desktopCode.replace(/"use client"\s*/, `"use client"\nimport { UnreadBadge } from "@/components/domain/messages/UnreadBadge";\n`);
  fs.writeFileSync('src/components/domain/DesktopNav.tsx', desktopCode);
}
