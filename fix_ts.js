const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');
code = code.replace(/videoRef\?: React\.RefObject<HTMLVideoElement>;/, `videoRef?: React.RefObject<HTMLVideoElement | null>;`);
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log("FIXED TS");
