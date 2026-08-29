const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

const danglingRegex = /\s*if \(p\.displayStyle === 'text'\) \{[\s\S]*?\/\/\s*Default Card[\s\S]*?<\/div>;\s*\}/;
code = code.replace(danglingRegex, '');

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed dangling code');
