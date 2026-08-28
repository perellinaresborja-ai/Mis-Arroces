const fs = require('fs');

let agents = fs.readFileSync('AGENTS.md', 'utf8');

agents += `
- REFUERZO: Cuando se hace algo, se hace para que funcione, no de adorno. Todo botón, menú o interfaz visual debe tener su funcionalidad real implementada por detrás (base de datos, páginas, etc.) en el mismo momento. No dejar "alertas" ni cosas a medias simulando que funcionan.
`;

fs.writeFileSync('AGENTS.md', agents);
console.log("UPDATED AGENTS.MD");
