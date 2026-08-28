const fs = require('fs');

let social = fs.readFileSync('src/components/domain/SocialElaborationModal.tsx', 'utf8');

// 1. Revert DEBUG FORCED isOwner to actual logic
social = social.replace(/const isOwner = true; \/\/ DEBUG FORCED/g, `const isOwner = currentUserId && item.author?.id === currentUserId;`);

// 2. Remove hardcoded Editar Link
social = social.replace(/\{isOwner && \(\s*<Link href=\{\`\$\{href\}\/edit\`\}[\s\S]*?<\/Link>\s*\)\}/g, '');

// 3. Inject PostOptionsMenu into Desktop Header right before X
social = social.replace(
  /<button onClick=\{onClose\} className="hover:bg-muted p-1\.5 rounded-full transition"><X className="w-5 h-5"\/><\/button>/g,
  `{isOwner && <PostOptionsMenu entityType={item.entity_type} entityId={item.id} allowComments={item.allow_comments ?? true} onDeleted={onClose} />}\n              <button onClick={onClose} className="hover:bg-muted p-1.5 rounded-full transition"><X className="w-5 h-5"/></button>`
);

fs.writeFileSync('src/components/domain/SocialElaborationModal.tsx', social);
console.log("FIXED SOCIAL MODAL UI AND REVERTED DEBUG");

// FeedCard.tsx
let feed = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feed = feed.replace(/isOwner=\{true\} \/\* DEBUG FORCING TO TRUE \*\//g, `isOwner={currentUserId === user.id}`);
fs.writeFileSync('src/components/domain/FeedCard.tsx', feed);
console.log("REVERTED FEED CARD DEBUG");
