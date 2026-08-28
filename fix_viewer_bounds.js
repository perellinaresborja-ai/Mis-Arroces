const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// The img currently has `className="w-full h-full object-contain md:object-cover"`
// We change it to `className="max-w-full max-h-full object-contain md:object-cover"`
// So it naturally sizes itself instead of filling the container with letterboxes.

code = code.replace(
  'className="w-full h-full object-contain md:object-cover"',
  'className="max-w-full max-h-full object-contain md:object-cover"'
);

// Do it for both video and img just in case
code = code.replace(
  'className="w-full h-full object-contain md:object-cover"',
  'className="max-w-full max-h-full object-contain md:object-cover"'
);
code = code.replace(
  'className="w-full h-full object-contain md:object-cover"',
  'className="max-w-full max-h-full object-contain md:object-cover"'
);
code = code.replace(
  'className="w-full h-full object-contain md:object-cover"',
  'className="max-w-full max-h-full object-contain md:object-cover"'
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
