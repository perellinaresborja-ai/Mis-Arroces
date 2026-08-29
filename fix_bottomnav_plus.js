const fs = require('fs');

let code = fs.readFileSync('src/components/domain/BottomNav.tsx', 'utf8');

code = code.replace(
  /createMenuOpen \? "bg-primary rotate-45" : "bg-primary"/,
  'createMenuOpen ? "bg-[#E69A21] rotate-45" : "bg-[#E69A21]"'
);

fs.writeFileSync('src/components/domain/BottomNav.tsx', code);
console.log('Fixed BottomNav + button');
