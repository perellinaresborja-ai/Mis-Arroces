const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

// Replace the literal string "\n            </label>\n          )}" with actual newlines
code = code.replace("Tu historia</span>\\n            </label>\\n          )}", `Tu historia</span>
            </label>
          )}`);

fs.writeFileSync('src/components/domain/StoriesBar.tsx', code);
console.log('Fixed literal newlines');
