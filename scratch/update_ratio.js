const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

const regex = /\{ratio && \(\s*<div className="flex flex-col">\s*<span className="text-muted-foreground text-\[10px\] md:text-xs uppercase tracking-wider mb-1">Proporción<\/span>\s*<span className="font-semibold text-foreground">1:\{ratio\}<\/span>\s*<\/div>\s*\)\}/;

const newRatioBlock = `{ratio && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-0.5">Proporción</span>
                    <span className="text-[9px] font-bold text-muted-foreground/60 tracking-widest leading-none mb-1">ARROZ:CALDO</span>
                    <span className="font-semibold text-foreground">1:{ratio}</span>
                  </div>
                )}`;

if (regex.test(code)) {
  code = code.replace(regex, newRatioBlock);
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log("Successfully updated Proporción display!");
} else {
  console.log("Could not find Proporción block to replace.");
}
