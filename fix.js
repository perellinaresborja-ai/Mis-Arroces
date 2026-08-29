const fs = require('fs');
['src/components/domain/CommentSection.tsx', 'src/components/domain/BottomNav.tsx', 'src/components/domain/DesktopNav.tsx', 'src/components/domain/FollowsModal.tsx', 'src/components/domain/ProfileHighlightsClient.tsx', 'src/components/domain/SocialElaborationModal.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('use client')) {
      content = content.replace(/['"]use client['"][\n\r;]*/g, '');
      content = '"use client"\n' + content;
      fs.writeFileSync(file, content);
      console.log('Fixed use client in', file);
    }
  }
});
