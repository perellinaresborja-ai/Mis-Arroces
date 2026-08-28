const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');

// Add authorId to props
code = code.replace(/currentUserId: string \| null/, `currentUserId: string | null\n    authorId?: string`);
code = code.replace(/currentUserId,\n\s*allowComments/, `currentUserId,\n    authorId,\n    allowComments`);

// Modify the logic to only show the menu if currentUserId === authorId
code = code.replace(/\{currentUserId && \(/, `{currentUserId && currentUserId === authorId && (`);

fs.writeFileSync('src/components/domain/CommentsModal.tsx', code);
console.log("ADDED AUTHORID TO COMMENTS MODAL");

let feedCode = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feedCode = feedCode.replace(/currentUserId=\{currentUserId\}\n\s*allowComments=\{true\}/, `currentUserId={currentUserId}\n          authorId={user.id}\n          allowComments={true}`);
fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCode);
console.log("PASSED AUTHORID FROM FEEDCARD");
