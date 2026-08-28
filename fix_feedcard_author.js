const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

code = code.replace(
  /currentUserId=\{currentUserId\}\s*\n\s*allowComments=\{true\}/,
  `currentUserId={currentUserId}\n        authorId={user.id}\n        allowComments={true}`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
console.log("FIXED FEEDCARD");
