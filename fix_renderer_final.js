const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

const regex = /const mediaStyle: CSSProperties = \{.*?pointerEvents: 'none',\n  \}/s;

const cleanStyle = `const mediaStyle: CSSProperties = {
    position: 'relative',
    transform: transform ? \`translate(\${transform.translateX}px, \${transform.translateY}px) scale(\${transform.scale}) rotate(\${transform.rotation || 0}deg)\` : 'none',
    transformOrigin: 'center center',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    zIndex: 1,
    pointerEvents: 'none',
  }`;

code = code.replace(regex, cleanStyle);
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
