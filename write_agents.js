const fs = require('fs');

const rule = `
## Línea Gráfica de Mis Arroces
- Todas las tarjetas, contenedores de feed, modales y barras de contenido deben tener bordes redondeados (\`rounded-2xl\` o \`rounded-3xl\`), fondo \`bg-card\` y un borde \`border border-border\`.
- No usar diseños de bloque a sangre (flush sin bordes ni redondeo) para los contenedores principales (por ejemplo, barra de historias, publicaciones).
`;

let content = fs.readFileSync('AGENTS.md', 'utf8');
content = content.replace(/## LÃ­nea GrÃ¡fica[\s\S]*/, '').trim() + '\n' + rule;
fs.writeFileSync('AGENTS.md', content, 'utf8');
