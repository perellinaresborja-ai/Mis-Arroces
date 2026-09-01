const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

const regex = /\{\s*vesselDetails\?\.diameter_cm\s*&&\s*\([\s\S]*?<Circle[\s\S]*?<\/div>\s*\)\s*\}/;

// But wait, there are TWO occurrences of `vesselDetails?.diameter_cm && (` in the file now.
// 1. Inside Elegant Stats Row (has <Circle />)
// 2. Inside Ficha Técnica (has text "Medida de paella")

// So the regex finding <Circle will correctly target ONLY the one in the Stats Row!
if (regex.test(code)) {
  code = code.replace(regex, '');
  fs.writeFileSync(targetFile, code);
  console.log("Successfully removed Paella diameter from Elegant Stats Row!");
} else {
  console.log("Could not find the block to remove.");
}
