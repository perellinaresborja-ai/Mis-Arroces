const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

const start = code.indexOf('const mediaStyle: CSSProperties = {');
const end = code.indexOf('return (', start);

const cleanBlock = `const mediaStyle: CSSProperties = {
    position: 'relative',
    transform: transform ? \`translate(\${transform.translateX}px, \${transform.translateY}px) scale(\${transform.scale}) rotate(\${transform.rotation || 0}deg)\` : 'none',
    transformOrigin: 'center center',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    zIndex: 1,
    pointerEvents: 'none',
  }

  `;

code = code.substring(0, start) + cleanBlock + code.substring(end);
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
