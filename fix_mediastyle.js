const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

const targetMediaStyle = `    const mediaStyle: CSSProperties = {
      position: 'absolute',
      transform: transform ? \`translate(\${transform.translateX}px, \${transform.translateY}px) scale(\${transform.scale}) rotate(\${transform.rotation || 0}deg)\` : 'none',
      transformOrigin: 'center center',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      zIndex: 1,
      pointerEvents: 'none',
    }`;

const replacementMediaStyle = `    const mediaStyle: CSSProperties = {
      position: 'relative',
      transform: transform ? \`translate(\${transform.translateX}px, \${transform.translateY}px) scale(\${transform.scale}) rotate(\${transform.rotation || 0}deg)\` : 'none',
      transformOrigin: 'center center',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      zIndex: 1,
      pointerEvents: 'none',
    }`;

if (code.includes(targetMediaStyle)) {
  code = code.replace(targetMediaStyle, replacementMediaStyle);
  fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
  console.log("Replaced mediaStyle!");
} else {
  console.log("NOT FOUND, doing regex");
  const regex = /const mediaStyle: CSSProperties = \{.*?\}/s;
  if (regex.test(code)) {
    code = code.replace(regex, replacementMediaStyle);
    fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
    console.log("Replaced via regex!");
  }
}
