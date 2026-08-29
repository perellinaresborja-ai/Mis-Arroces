const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace("import React from 'react';\n\"use client\"", "\"use client\"\nimport React from 'react';");
code = code.replace("import React from 'react';\r\n\"use client\"", "\"use client\"\r\nimport React from 'react';");

code = code.replace(/if \(mode === 'VIEWER' && story\) \{/g, 'if (mode === "VIEWER" && storyId) {');

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed SharedStoryRenderer');
