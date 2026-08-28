const fs = require('fs');

let feedCard = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

feedCard = feedCard.replace(/linkedRecipe,/, `linkedRecipe,\n  isPinned,`);
feedCard = feedCard.replace(/isPinned=\{post\.is_pinned\}/g, `isPinned={isPinned}`);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feedCard);
console.log("FIXED FEEDCARD");
