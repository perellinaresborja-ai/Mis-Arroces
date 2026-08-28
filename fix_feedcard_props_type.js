const fs = require('fs');

let feedCard = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

feedCard = feedCard.replace(
  /linkedRecipe\?: \{\n    id: string\n    name: string\n  \}/,
  `linkedRecipe?: {\n    id: string\n    name: string\n  }\n  isPinned?: boolean`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCard);
console.log("FIXED FeedCardProps");
