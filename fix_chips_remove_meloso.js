const fs = require('fs');
let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');
code = code.replace(
  "['Seco', 'Caldoso', 'Meloso', 'Al horno']", 
  "['Seco', 'Caldoso', 'Al horno']"
);
fs.writeFileSync('src/app/discover/page.tsx', code);
