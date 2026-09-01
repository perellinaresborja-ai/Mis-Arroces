const fs = require('fs');
const path = require('path');

const btnPath = path.resolve('src/components/domain/AddToCartButton.tsx');
let code = fs.readFileSync(btnPath, 'utf8');

// Fix encodings
code = code.replace(/AÃ±adido/g, 'Añadido');
code = code.replace(/AÃ±adir/g, 'Añadir');
code = code.replace(/Â¿Para cuÃ¡ntas/g, '¿Para cuántas');

// Layout: Make it flex-row but wrap if absolutely necessary, but try to stay on one line
code = code.replace('flex-col sm:flex-row', 'flex-row flex-wrap');

// Reduce height: py-3 -> py-2
code = code.replace(/py-3/g, 'py-2');

// Make first button one-line and smaller text if horizontal
code = code.replace(
  'text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-2" : "w-full"}',
  'text-xs sm:text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-1 sm:px-2 whitespace-nowrap" : "w-full"}'
);

// Make second button flex-1 and one-line if horizontal
code = code.replace(
  'gap-2 w-full py-2 bg-muted/30 border border-border text-foreground font-semibold',
  'gap-2 py-2 bg-muted/30 border border-border text-foreground font-semibold text-xs sm:text-sm md:text-base ${layout === "horizontal" ? "flex-1 px-1 sm:px-2 whitespace-nowrap" : "w-full"}'
);

fs.writeFileSync(btnPath, code, 'utf8');
console.log("Updated AddToCartButton perfectly!");
