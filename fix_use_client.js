const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

if (code.startsWith('import { PaellaIcon }')) {
  code = code.replace('import { PaellaIcon } from "@/components/icons/PaellaIcon"\n"use client"\n', '"use client"\nimport { PaellaIcon } from "@/components/icons/PaellaIcon"\n');
  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
  console.log('Fixed use client directive position');
} else {
  console.log('Not matching');
}
