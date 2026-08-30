const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

code = code.replace(
  /<CommentsModal[^>]+>/g,
  `<FeedCommentsInline
        isOpen={isCommentsOpen}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        allowComments={true}
      />`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
console.log('Fixed CommentsModal leftover');
