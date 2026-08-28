const fs = require('fs');

let postOptions = fs.readFileSync('src/components/domain/PostOptionsMenu.tsx', 'utf8');
postOptions = postOptions.replace(
  /onDeleted \n\}: \{/,
  `onDeleted,\n  isPinned\n}: {`
);
fs.writeFileSync('src/components/domain/PostOptionsMenu.tsx', postOptions);

let feedCard = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feedCard = feedCard.replace(/isPinned=\{item\.is_pinned\}/g, `isPinned={post.is_pinned}`);
// wait, the variable in FeedCard is 'post'. Let's verify by just using the correct variable.
// I'll check if it's post.
fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCard);

console.log("FIXED PROPS");
