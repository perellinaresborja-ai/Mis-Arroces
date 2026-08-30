const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// Change objectFit: 'contain' to objectFit: 'cover' in actualMediaStyle
code = code.replace(
  "const actualMediaStyle: CSSProperties = {\n    position: 'absolute',\n    width: '100%',\n    height: '100%',\n    objectFit: 'contain',",
  "const actualMediaStyle: CSSProperties = {\n    position: 'absolute',\n    width: '100%',\n    height: '100%',\n    objectFit: 'cover',"
);

// We should also look for any other 'contain' just in case the regex doesn't match perfectly.
code = code.replace(/objectFit: 'contain'/g, "objectFit: 'cover'");

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed objectFit to cover');
