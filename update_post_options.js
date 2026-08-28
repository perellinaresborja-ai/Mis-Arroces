const fs = require('fs');

let postOptionsMenu = fs.readFileSync('src/components/domain/PostOptionsMenu.tsx', 'utf8');

postOptionsMenu = postOptionsMenu.replace(
  /if \(entityType === 'recipe'\) \{\s*router\.push\(\`\/recipes\/\$\{entityId\}\/edit\`\);\s*\} else \{\s*alert\("La página de edición para este tipo está en construcción"\);\s*\}/,
  `if (entityType === 'recipe') {
      router.push(\`/recipes/\${entityId}/edit\`);
    } else if (entityType === 'post') {
      router.push(\`/posts/\${entityId}/edit\`);
    } else if (entityType === 'session') {
      router.push(\`/sessions/\${entityId}/edit\`);
    }`
);

fs.writeFileSync('src/components/domain/PostOptionsMenu.tsx', postOptionsMenu);
console.log("UPDATED POST OPTIONS MENU ROUTING");
