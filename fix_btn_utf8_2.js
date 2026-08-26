const fs = require('fs');

let btn = fs.readFileSync('src/components/domain/AddToCartButton.tsx', 'utf8');

btn = btn.replace(/AÃ±adido/g, 'Añadido');
btn = btn.replace(/AÃ±adir/g, 'Añadir');

// Also remove the JSX comment {/* @ts-ignore */} which might break inside a return statement if not wrapped properly
btn = btn.replace(/\{\/\* @ts-ignore \*\/\}\n\s*<div/g, '<div');

fs.writeFileSync('src/components/domain/AddToCartButton.tsx', btn, 'utf8');
