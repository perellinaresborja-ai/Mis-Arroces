const fs = require('fs');

function removeNav(file) {
  let f = fs.readFileSync(file, 'utf8');
  
  // Regex to remove the Compra nav item
  const regex = /\{\s*href:\s*"\/shopping-list",\s*icon:\s*ShoppingCart,\s*label:\s*"Compra",?\s*\},/g;
  f = f.replace(regex, '');
  
  fs.writeFileSync(file, f, 'utf8');
}

removeNav('src/components/domain/BottomNav.tsx');
removeNav('src/components/domain/DesktopNav.tsx');
