const fs = require('fs');

let feedCard = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

feedCard = feedCard.replace(
  /linkedRecipe\?: \{ id: string, name: string \}/,
  `linkedRecipe?: { id: string, name: string }\n  isPinned?: boolean`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCard);
console.log("FIXED FeedCardProps again");
