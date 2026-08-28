const fs = require('fs');

let feedCard = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

// The item prop is an 'any' which contains is_pinned
feedCard = feedCard.replace(
  /allowComments=\{true\}/,
  `allowComments={true} 
            isPinned={item.is_pinned}`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCard);
console.log("UPDATED FeedCard");
