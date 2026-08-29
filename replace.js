const fs = require('fs');

const path = require('path');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const regex = /<img\s+src={([^}]+)}\s+(?:alt={([^}]+)}\s+)?className="([^"]*w-full h-full object-cover[^"]*)"\s*\/>/g;
  
  if (regex.test(content)) {
    if (!content.includes('import { MediaImage }')) {
       content = `import { MediaImage } from "@/components/domain/MediaImage"\n` + content;
    }
    content = content.replace(regex, (match, src, alt, className) => {
      changed = true;
      return `<MediaImage src={${src}} alt={${alt || '"Image"'}} className="${className}" fill={true} />`;
    });
  }

  const regex2 = /<img\s+src={([^}]+)}\s+alt="([^"]+)"\s+className="([^"]*w-full h-full object-cover[^"]*)"\s*\/>/g;
  if (regex2.test(content)) {
    if (!content.includes('import { MediaImage }')) {
       content = `import { MediaImage } from "@/components/domain/MediaImage"\n` + content;
    }
    content = content.replace(regex2, (match, src, alt, className) => {
      changed = true;
      return `<MediaImage src={${src}} alt="${alt}" className="${className}" fill={true} />`;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

processFile('src/app/page.tsx');
processFile('src/app/me/page.tsx');
processFile('src/components/domain/StoriesViewer.tsx');
processFile('src/components/domain/CommentSection.tsx');
processFile('src/components/domain/DesktopNav.tsx');
processFile('src/components/domain/BottomNav.tsx');
processFile('src/components/domain/FollowsModal.tsx');
processFile('src/components/domain/ProfileHighlightsClient.tsx');
processFile('src/components/domain/SocialElaborationModal.tsx');
