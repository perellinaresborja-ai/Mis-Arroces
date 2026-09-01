const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('src/app/recipes/[id]/page.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// Description paragraph
code = code.replace(
  'p className="mt-4 md:mt-6 text-muted-foreground',
  'p className="mt-4 md:mt-0 text-muted-foreground'
);

// Elegant Stats Row
code = code.replace(
  'div className="flex flex-wrap items-center gap-x-8 lg:gap-x-12 gap-y-5 mt-6 md:mt-8 py-5 border-y border-border"',
  'div className="flex flex-wrap items-center gap-x-8 lg:gap-x-12 gap-y-5 mt-6 md:mt-0 py-4 md:py-0 md:border-y-0 border-y border-border"'
);
// Wait, if I remove py-5 and border-y on desktop, it will look different. Let's keep py-5 and border-y, just remove mt-8.
code = code.replace(
  'div className="flex flex-wrap items-center gap-x-8 lg:gap-x-12 gap-y-5 mt-6 md:mt-0 py-4 md:py-0 md:border-y-0 border-y border-border"',
  'div className="flex flex-wrap items-center gap-x-8 lg:gap-x-12 gap-y-5 mt-6 md:mt-0 py-4 border-y border-border"'
);
// I'll just restore the original and replace cleanly:
code = fs.readFileSync(targetFile, 'utf8');

code = code.replace(
  'p className="mt-4 md:mt-6 text-muted-foreground',
  'p className="mt-4 md:mt-0 text-muted-foreground'
);

code = code.replace(
  'gap-y-5 mt-6 md:mt-8 py-5 border-y border-border"',
  'gap-y-5 mt-6 md:mt-0 py-5 border-y border-border"'
);

code = code.replace(
  'div className="mt-8 bg-muted/20 rounded-2xl p-5 border border-border/50 w-full"',
  'div className="mt-8 md:mt-0 bg-muted/20 rounded-2xl p-5 border border-border/50 w-full"'
);

code = code.replace(
  'div className="w-full mt-8 flex justify-center"',
  'div className="w-full mt-8 md:mt-0 flex justify-center"'
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Updated margins to md:mt-0 to allow justify-between to work perfectly on desktop!");
