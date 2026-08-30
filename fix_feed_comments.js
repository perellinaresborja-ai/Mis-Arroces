const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

// Replace import
code = code.replace(
  'import { CommentsModal } from "@/components/domain/CommentsModal"',
  'import { FeedCommentsInline } from "@/components/domain/FeedCommentsInline"'
);

// Replace component usage
const oldModal = `<CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        isOwner={currentUserId === user.id}
        allowComments={true} // Feed components usually allow comments, or we could fetch it.
      />`;

const newInline = `<FeedCommentsInline
        isOpen={isCommentsOpen}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        allowComments={true}
      />`;

code = code.replace(oldModal, newInline);

// Also need to toggle isCommentsOpen instead of just setting to true
code = code.replace(
  'setIsCommentsOpen(true)',
  'setIsCommentsOpen(!isCommentsOpen)'
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
console.log('Fixed FeedCard inline comments');
