const fs = require('fs');

let code = fs.readFileSync('src/components/domain/MediaImage.tsx', 'utf8');

code = code.replace(
  /isPrivate\?: boolean/,
  'isPrivate?: boolean\n  unoptimized?: boolean'
);

code = code.replace(
  /isPrivate = false\n\}: MediaImageProps\) \{/,
  'isPrivate = false,\n  unoptimized = false\n}: MediaImageProps) {'
);

code = code.replace(
  /const unoptimized = isPrivate;/,
  'const shouldUnoptimize = unoptimized || isPrivate;'
);

code = code.replace(
  /unoptimized=\{unoptimized\}/g,
  'unoptimized={shouldUnoptimize}'
);

fs.writeFileSync('src/components/domain/MediaImage.tsx', code);
console.log('Fixed MediaImage');
