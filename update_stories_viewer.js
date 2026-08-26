const fs = require('fs');
const path = 'src/components/domain/StoriesViewer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert import if not exists
if (!content.includes('SharedStoryRenderer')) {
  content = content.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { SharedStoryRenderer } from "./SharedStoryRenderer"');
}

// Replace the rendering inside the viewer
// Find where the image is rendered
const regex = /<img[^>]*src=\{currentMedia\.media_assets\.url\}[^>]*\/>/g;
const replacement = 
<SharedStoryRenderer 
  mode="VIEWER"
  mediaUrl={currentMedia?.media_assets?.url}
  transform={currentStory.media_transform}
  background={currentStory.background}
  overlays={currentStory.overlays || []}
/>
;
content = content.replace(regex, replacement);

fs.writeFileSync(path, content, 'utf8');
