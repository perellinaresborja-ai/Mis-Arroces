const fs = require('fs');

let btn = fs.readFileSync('src/components/domain/AddToCartButton.tsx', 'utf8');

btn = btn.replace(/AÃ±adido/g, 'Añadido');
btn = btn.replace(/AÃ±adir/g, 'Añadir');

fs.writeFileSync('src/components/domain/AddToCartButton.tsx', btn, 'utf8');
