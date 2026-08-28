const fs = require('fs');

let commentsCode = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');
commentsCode = commentsCode.replace(/authorId\?: string/, `isOwner?: boolean`);
commentsCode = commentsCode.replace(/currentUserId, authorId, allowComments/, `currentUserId, isOwner, allowComments`);
commentsCode = commentsCode.replace(/\{currentUserId && currentUserId === authorId && \(/, `{isOwner && (`);
fs.writeFileSync('src/components/domain/CommentsModal.tsx', commentsCode);
console.log("UPDATED COMMENTS MODAL");

let feedCode = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feedCode = feedCode.replace(/authorId=\{user\.id\}/, `isOwner={currentUserId === user.id}`);
fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCode);
console.log("UPDATED FEED CARD");
