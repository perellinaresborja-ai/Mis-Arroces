const fs = require('fs');

let feedList = fs.readFileSync('src/components/domain/FeedList.tsx', 'utf8');

feedList = feedList.replace(/linkedRecipe=\{item\.linkedRecipe\}/g, `linkedRecipe={item.linkedRecipe}\n          isPinned={item.is_pinned}`);

fs.writeFileSync('src/components/domain/FeedList.tsx', feedList);
console.log("UPDATED FeedList");
