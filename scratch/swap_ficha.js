const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

const ratioBlock = `                {ratio && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Proporción</span>
                    <span className="font-semibold text-foreground">1:{ratio}</span>
                  </div>
                )}`;

const paellaBlock = `                {vesselDetails?.diameter_cm && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-0.5">Medida de paella</span>
                    <span className="font-semibold text-foreground">{vesselDetails.diameter_cm} cm</span>
                  </div>
                )}`;

const currentLayout = ratioBlock + '\n' + paellaBlock;
const newLayout = paellaBlock + '\n' + ratioBlock;

if (code.includes(currentLayout)) {
  code = code.replace(currentLayout, newLayout);
  fs.writeFileSync(targetFile, code);
  console.log("Successfully swapped Proporción and Paella!");
} else {
  // try different whitespace
  const regex = /\{\s*ratio\s*&&\s*\([\s\S]*?1:\{ratio\}<\/span>\s*<\/div>\s*\)\s*\}\s*\{\s*vesselDetails\?\.diameter_cm\s*&&\s*\([\s\S]*?\{vesselDetails\.diameter_cm\}\s*cm<\/span>\s*<\/div>\s*\)\s*\}/;
  if (regex.test(code)) {
    const match = code.match(regex)[0];
    const matchRatio = match.substring(0, match.indexOf('{vesselDetails?.diameter_cm &&'));
    const matchPaella = match.substring(match.indexOf('{vesselDetails?.diameter_cm &&'));
    const swapped = matchPaella + matchRatio;
    code = code.replace(match, swapped);
    fs.writeFileSync(targetFile, code);
    console.log("Successfully swapped via regex!");
  } else {
    console.log("Could not find the blocks to swap.");
  }
}
