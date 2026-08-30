const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(
  "objectFit: 'cover',",
  "objectFit: 'contain',"
);

code = code.replace(
  "transform: transform ? ('translate(' + transform.translateX + 'px, ' + transform.translateY + 'px) scale(' + transform.scale + ')') : 'none',",
  "transform: transform ? ('translate(' + (transform.translateX||0) + 'px, ' + (transform.translateY||0) + 'px) scale(' + (transform.scale||1) + ') rotate(' + (transform.rotation||0) + 'deg)') : 'none',"
);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed SharedStoryRenderer');
