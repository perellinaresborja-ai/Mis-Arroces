const fs = require('fs');
const path = require('path');

const btnPath = path.resolve('src/components/domain/AddToCartButton.tsx');
let code = fs.readFileSync(btnPath, 'utf8');

code = code.replace(
  '"flex items-center justify-center gap-2 py-2 bg-muted/30 border border-border text-foreground font-semibold text-xs sm:text-sm md:text-base ${layout === \\"horizontal\\" ? \\"flex-1 px-1 sm:px-2 whitespace-nowrap\\" : \\"w-full\\"} rounded-2xl hover:bg-muted/50 transition-colors"',
  '`flex items-center justify-center gap-2 py-2 bg-muted/30 border border-border text-foreground font-semibold rounded-2xl hover:bg-muted/50 transition-colors text-xs sm:text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-1 sm:px-2 whitespace-nowrap" : "w-full"}`'
);

fs.writeFileSync(btnPath, code, 'utf8');
console.log("Fixed template literal!");
