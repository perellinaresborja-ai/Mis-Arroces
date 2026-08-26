const fs = require('fs');
let content = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

content = content.replace(/ConfiguraciÃƒÂ³n/g, 'Configuración');
content = content.replace(/PrÃƒÂ³ximamente/g, 'Próximamente');
content = content.replace(/AÃƒÂºn/g, 'Aún');
content = content.replace(/secciÃƒÂ³n/g, 'sección');
content = content.replace(/todavÃƒÂ­a/g, 'todavía');
content = content.replace(/VÃ­deos/g, 'Vídeos'); // Note: single encoding error here?
content = content.replace(/VÃƒÂ­deos/g, 'Vídeos');

fs.writeFileSync('src/app/[userParam]/page.tsx', content, 'utf8');
console.log('Fixed encodings in profile');
