const fs = require('fs');
let f = fs.readFileSync('src/components/domain/EscandalloSection.tsx', 'utf8');

f = f.replace(
  /<span className="text-xs \n?bg-muted text-muted-foreground px-2 py-1 rounded-full font-normal">Opcional<\/span>/,
  ''
);
// just in case it's on one line
f = f.replace(
  /<span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-normal">Opcional<\/span>/,
  ''
);

fs.writeFileSync('src/components/domain/EscandalloSection.tsx', f, 'utf8');
