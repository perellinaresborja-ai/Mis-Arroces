const fs = require('fs');

const files = ['src/components/domain/StoriesBar.tsx', 'src/components/domain/GlobalCreateMenu.tsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/className="hidden" accept="image\/\*,video\/\*"/, 'className="opacity-0 absolute w-0 h-0 pointer-events-none -z-50" accept="image/*,video/*"');
  fs.writeFileSync(file, code);
  console.log('Fixed hidden input in ' + file);
});
