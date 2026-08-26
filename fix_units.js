const fs = require('fs');

let file = fs.readFileSync('src/app/shopping-list/ShoppingListClient.tsx', 'utf8');

file = file.replace(/item\.unit\?\.symbol/g, 'item.unit?.name');

// Fix utf8 string rendering
file = file.replace(/Tu lista estÃ¡ vacÃ­a\./g, 'Tu lista está vacía.');
file = file.replace(/AÃ±ade ingredientes desde cualquier receta\./g, 'Añade ingredientes desde cualquier receta.');

fs.writeFileSync('src/app/shopping-list/ShoppingListClient.tsx', file, 'utf8');

let page = fs.readFileSync('src/app/shopping-list/page.tsx', 'utf8');
page = page.replace(/Tu lista estÃ¡ vacÃ­a\./g, 'Tu lista está vacía.');
page = page.replace(/AÃ±ade ingredientes desde cualquier receta\./g, 'Añade ingredientes desde cualquier receta.');
fs.writeFileSync('src/app/shopping-list/page.tsx', page, 'utf8');
