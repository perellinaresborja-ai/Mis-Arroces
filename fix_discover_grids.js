const fs = require('fs');
let code = fs.readFileSync('src/app/discover/page.tsx', 'utf8');

// Change popular and recent sections from horizontal scroll to grid-cols-3
code = code.replace(
  /<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">\s*\{homeData\.popular/g,
  '<div className="grid grid-cols-3 gap-1 md:gap-4 pb-4">\n              {homeData.popular'
);

code = code.replace(
  /<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">\s*\{homeData\.recent/g,
  '<div className="grid grid-cols-3 gap-1 md:gap-4 pb-4">\n              {homeData.recent'
);

// We need to change the child element sizes too. Currently it's w-64 for horizontal scrolling.
// For popular
code = code.replace(
  /className="snap-start shrink-0 w-64 group block/g,
  'className="group block'
);

// Wait, the popular and recent cards probably have different paddings and texts. 
// If they are in a 3-column grid on mobile, they need to be smaller, maybe aspect-square, like the search results!
// Let's replace the whole Link structure for popular and recent to match the search results exactly!

fs.writeFileSync('src/app/discover/page.tsx', code);
console.log('Fixed discover grids');
