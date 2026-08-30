const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  '<Camera size={20}/><span className="text-xs">Cambiar</span>',
  '<Camera size={20}/><span className="text-xs">Comparte</span>'
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Changed text to Comparte');
