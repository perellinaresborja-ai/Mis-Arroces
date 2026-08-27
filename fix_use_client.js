const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

code = code.replace('import { ShareDMModal } from "./ShareDMModal"\n"use client"', '"use client"\nimport { ShareDMModal } from "./ShareDMModal"');

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
