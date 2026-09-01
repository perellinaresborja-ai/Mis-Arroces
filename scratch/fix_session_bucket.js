const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/sessions/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(
  '<MediaCarousel items={media} bucket="sessions" />',
  '<MediaCarousel items={media} />'
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Fixed MediaCarousel bucket!");
