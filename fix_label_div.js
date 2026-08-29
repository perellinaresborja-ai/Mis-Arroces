const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

code = code.replace(
  /<input type="file" className="sr-only" accept="image\/\*,video\/\*" onChange=\{handleFileChange\} \/>\s*\+\s*<\/div>/,
  `<input type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                    +
                  </label>`
);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed label div');
